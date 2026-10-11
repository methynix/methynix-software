const ClientProject = require("../models/clientProjectModel");
const DocumentModel = require("../models/documentModel");
const Payment = require("../models/paymentModel");
const Counter = require("../models/counterModel");
const storage = require("../services/storageService");
const mail = require("../services/mailService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Linear order of the happy path; on_hold and lost sit outside it.
const FLOW = ClientProject.STATUSES.filter((s) => !["on_hold", "lost"].includes(s));

// Move a project forward to `target` when an action implies it (sending a
// proposal, uploading a signed contract...). Never moves it backwards.
const advance = async (project, target) => {
  if (["on_hold", "lost"].includes(project.status)) return project;
  if (FLOW.indexOf(target) <= FLOW.indexOf(project.status)) return project;
  return ClientProject.update(project.id, { status: target });
};

const devPaidByProject = async () => {
  const payments = await Payment.all();
  const map = {};
  payments.forEach((p) => {
    if (!p.project_id || p.kind !== "development") return;
    map[p.project_id] = (map[p.project_id] || 0) + p.amount;
  });
  return map;
};

const decodeBase64 = (value = "") => Buffer.from(String(value).replace(/^data:[^;]+;base64,/, ""), "base64");

const uniqueFolder = async (name) => {
  const base = storage.slugify(name);
  let folder = base;
  let n = 2;
  while (await ClientProject.folderTaken(folder)) folder = `${base}-${n++}`;
  return folder;
};

const loadProject = async (id, next) => {
  const project = await ClientProject.findById(id);
  if (!project) next(new AppError("Project not found.", 404));
  return project;
};

exports.list = catchAsync(async (req, res) => {
  const [projects, paid] = await Promise.all([ClientProject.all(), devPaidByProject()]);
  const data = projects.map((p) => ({ ...p, paid: paid[p.id] || 0 }));
  res.status(200).json({ status: "success", data });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const project = await loadProject(req.params.id, next);
  if (!project) return;
  const [payments, documents] = await Promise.all([
    Payment.all({ project_id: project.id }),
    DocumentModel.all({ project_id: project.id }),
  ]);
  const paid = payments.filter((p) => p.kind === "development").reduce((s, p) => s + p.amount, 0);
  res.status(200).json({
    status: "success",
    data: { ...project, paid, payments, documents },
    storage: storage.isConfigured(),
  });
});

exports.create = catchAsync(async (req, res, next) => {
  if (!req.body.name || !String(req.body.name).trim()) {
    return next(new AppError("Give the project a name.", 400));
  }
  const folder = await uniqueFolder(req.body.name);
  const ref_no = req.body.ref_no || (await Counter.next("project"));
  const project = await ClientProject.create({ ...req.body, ref_no }, folder);

  // Make the folder visible in the R2 dashboard straight away. Not fatal: it
  // appears anyway with the first upload.
  if (storage.isConfigured()) {
    storage.createFolder(folder).catch((err) => console.error("[R2] Folder create failed:", err.message));
  }

  res.status(201).json({ status: "success", data: project });
});

exports.update = catchAsync(async (req, res, next) => {
  const before = await loadProject(req.params.id, next);
  if (!before) return;
  const project = await ClientProject.update(req.params.id, req.body);

  // The client hears from us automatically when their project is completed.
  let emailed = false;
  let emailError = null;
  if (project.status === "completed" && before.status !== "completed" && !project.completion_email_sent_at) {
    if (project.client.email) {
      try {
        await mail.sendProjectCompleted({ brand: project.brand, project });
        await ClientProject.markCompletionEmailSent(project.id);
        emailed = true;
      } catch (err) {
        emailError = err.message;
      }
    } else {
      emailError = "No client email on file, so no completion email was sent.";
    }
  }

  res.status(200).json({ status: "success", data: project, emailed, emailError });
});

exports.remove = catchAsync(async (req, res) => {
  // Files stay in R2 and payments stay in the books; only the record goes.
  await ClientProject.remove(req.params.id);
  res.status(200).json({ status: "success" });
});

const DOC_FLOW = {
  proposal: { category: "proposal", projectStatus: "proposal_sent" },
  contract: { category: "contract", projectStatus: "contract_sent" },
  technical: { category: "technical_doc", projectStatus: null },
  receipt: { category: "receipt", projectStatus: null },
};

// Store a generated PDF in the project's R2 folder and optionally email it to
// the client. The browser renders the PDF and sends it here as base64.
exports.deliver = catchAsync(async (req, res, next) => {
  let project = await loadProject(req.params.id, next);
  if (!project) return;

  const { doc_id, filename, pdf, email } = req.body;
  const doc = doc_id ? await DocumentModel.findById(doc_id) : null;
  if (!doc) return next(new AppError("Save the document before sending it.", 400));
  if (!pdf) return next(new AppError("The PDF is missing.", 400));
  if (email && !email.to) return next(new AppError("Add the client's email address first.", 400));

  const flow = DOC_FLOW[doc.type] || { category: "other", projectStatus: null };
  const body = decodeBase64(pdf);
  const name = filename || `${doc.type}-${doc.number}.pdf`;

  if (storage.isConfigured()) {
    const key = await storage.upload({ folder: project.storage_folder, filename: name, body, contentType: "application/pdf" });
    project = await ClientProject.addFile(project.id, {
      key,
      name,
      category: flow.category,
      size: body.length,
      content_type: "application/pdf",
    });
  } else if (!email) {
    return next(new AppError("Cloudflare R2 is not configured yet, so the file cannot be stored.", 400));
  }

  if (email) {
    await mail.sendClientDocument({
      brand: doc.data?.brand || project.brand,
      to: email.to,
      subject: email.subject || name,
      message: email.message || "",
      attachment: { filename: name, content: body },
    });
    if (doc.status === "draft") await DocumentModel.update(doc.id, { status: "sent" });
    if (flow.projectStatus) project = await advance(project, flow.projectStatus);
  }

  res.status(200).json({ status: "success", data: project, stored: storage.isConfigured(), emailed: Boolean(email) });
});

// Upload any file (signed contract, technical doc, design files...) into the
// project's folder.
exports.uploadFile = catchAsync(async (req, res, next) => {
  let project = await loadProject(req.params.id, next);
  if (!project) return;
  if (!storage.isConfigured()) {
    return next(new AppError("Cloudflare R2 is not configured yet. Add the R2 keys to the server .env.", 400));
  }

  const { filename, content_type, data, category } = req.body;
  if (!filename || !data) return next(new AppError("Choose a file to upload.", 400));
  const cat = ClientProject.FILE_CATEGORIES.includes(category) ? category : "other";
  const body = decodeBase64(data);

  const key = await storage.upload({ folder: project.storage_folder, filename, body, contentType: content_type });
  project = await ClientProject.addFile(project.id, { key, name: filename, category: cat, size: body.length, content_type: content_type || "" });

  if (cat === "signed_contract") {
    if (project.contract_doc_id) await DocumentModel.update(project.contract_doc_id, { status: "signed" });
    project = await advance(project, "signed");
  }

  res.status(201).json({ status: "success", data: project });
});

exports.fileUrl = catchAsync(async (req, res, next) => {
  const project = await loadProject(req.params.id, next);
  if (!project) return;
  const file = project.files.find((f) => f.id === req.params.fileId);
  if (!file) return next(new AppError("File not found.", 404));
  const url = await storage.signedUrl(file.key, file.name);
  res.status(200).json({ status: "success", url });
});

exports.removeFile = catchAsync(async (req, res, next) => {
  const project = await loadProject(req.params.id, next);
  if (!project) return;
  const file = project.files.find((f) => f.id === req.params.fileId);
  if (!file) return next(new AppError("File not found.", 404));
  if (storage.isConfigured()) await storage.remove(file.key);
  const data = await ClientProject.removeFile(project.id, file.id);
  res.status(200).json({ status: "success", data });
});

exports.advance = advance;
