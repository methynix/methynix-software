const ClientProject = require("../models/clientProjectModel");
const DocumentModel = require("../models/documentModel");
const Payment = require("../models/paymentModel");
const Counter = require("../models/counterModel");
const storage = require("../services/storageService");
const mail = require("../services/mailService");
const Settings = require("../models/settingsModel");
const rules = require("../services/projectRules");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Linear order of the happy path; on_hold and lost sit outside it.
const FLOW = ClientProject.STATUSES.filter((s) => !["on_hold", "lost", "maintenance"].includes(s));

// Move a project forward to `target` when an action implies it (sending a
// proposal, uploading a signed contract...). Never moves it backwards.
const advance = async (project, target) => {
  if (["on_hold", "lost", "maintenance"].includes(project.status)) return project;
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

// Documents are versioned per category: the next file of a category is v2, v3...
const VERSIONED = ["proposal", "contract", "technical_doc"];
const nextVersion = (project, category) =>
  VERSIONED.includes(category) ? project.files.filter((f) => f.category === category).length + 1 : null;

const readinessOf = async (project) => rules.readiness(project, await Payment.all({ project_id: project.id }));

// Once the signed contract and the deposit are both in, the project is Deposit paid.
const settleStage = async (project) => {
  const r = await readinessOf(project);
  if (project.status === "signed" && r.deposit_paid) return advance(project, "deposit_paid");
  return project;
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
  if (!id || typeof id !== "string") {
    next(new AppError("Invalid project ID.", 400));
    return null;
  }
  const project = await ClientProject.findById(id);
  if (!project) {
    next(new AppError("Project not found.", 404));
    return null;
  }
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
    data: { ...project, paid, payments, documents, readiness: rules.readiness(project, payments) },
    storage: storage.isConfigured(),
    finance: await Settings.getFinance(),
  });
});

exports.create = catchAsync(async (req, res, next) => {
  if (!req.body.name || !String(req.body.name).trim()) {
    return next(new AppError("Give the project a name.", 400));
  }
  const legacy = Boolean(req.body.legacy);
  // Past work may already live in an R2 folder; reuse it instead of a new one.
  let folder;
  if (legacy && req.body.storage_folder) {
    folder = String(req.body.storage_folder).trim().replace(/^\/+|\/+$/g, "");
    if (await ClientProject.folderTaken(folder)) return next(new AppError("That R2 folder already belongs to another project.", 400));
  } else {
    folder = await uniqueFolder(req.body.name);
  }
  const ref_no = req.body.ref_no || (await Counter.next("project"));
  // Past clients are filed as completed straight away, with no payments and no emails.
  const input = legacy ? { ...req.body, ref_no, status: "completed" } : { ...req.body, ref_no };
  const fin = await Settings.getFinance();
  const project = await ClientProject.create({ ...input, deposit_percent: input.deposit_percent ?? fin.deposit_percent }, folder);

  // Make the folder visible in the R2 dashboard straight away. Not fatal: it
  // appears anyway with the first upload.
  if (storage.isConfigured() && !(legacy && req.body.storage_folder)) {
    storage.createFolder(folder).catch((err) => console.error("[R2] Folder create failed:", err.message));
  }

  res.status(201).json({ status: "success", data: project });
});

exports.update = catchAsync(async (req, res, next) => {
  const before = await loadProject(req.params.id, next);
  if (!before) return;
  if (req.body.status && req.body.status !== before.status) {
    const blocked = rules.stageBlocker({ ...before, quote: req.body.quote ?? before.quote }, req.body.status, await readinessOf(before));
    if (blocked) return next(new AppError(blocked, 400));
  }
  const project = await ClientProject.update(req.params.id, req.body);

  // The client hears from us automatically when their project is completed.
  let emailed = false;
  let emailError = null;
  if (project.status === "completed" && before.status !== "completed" && !project.completion_email_sent_at && !project.legacy && req.body.send_email !== false) {
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
  const blocked = rules.docBlocker(flow.category, await readinessOf(project));
  if (blocked) return next(new AppError(blocked, 400));
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
      version: nextVersion(project, flow.category),
      source: "generated",
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
  if (!ClientProject.FILE_CATEGORIES.includes(category)) return next(new AppError("Choose what kind of document this is.", 400));
  const cat = category;
  const blocked = rules.docBlocker(cat, await readinessOf(project));
  if (blocked) return next(new AppError(blocked, 400));
  const body = decodeBase64(data);

  const key = await storage.upload({ folder: project.storage_folder, filename, body, contentType: content_type });
  project = await ClientProject.addFile(project.id, {
    key, name: filename, category: cat, size: body.length, content_type: content_type || "",
    version: nextVersion(project, cat), source: "uploaded",
  });

  if (cat === "signed_contract") {
    if (project.contract_doc_id) await DocumentModel.update(project.contract_doc_id, { status: "signed" });
    project = await advance(project, "signed");
    project = await settleStage(project);
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

// R2 objects under this project's folder (or another prefix) that are not yet
// attached to the project, so they can be linked without re-uploading.
exports.r2Files = catchAsync(async (req, res, next) => {
  const project = await loadProject(req.params.id, next);
  if (!project) return;
  if (!storage.isConfigured()) return next(new AppError("Cloudflare R2 is not configured yet.", 400));
  const prefix = String(req.query.prefix || `${project.storage_folder}/`).replace(/^\/+/, "");
  const linked = new Set(project.files.map((f) => f.key));
  const objects = (await storage.list(prefix)).filter((o) => !linked.has(o.key));
  res.status(200).json({ status: "success", data: objects, prefix });
});

// Attach files that are already in R2 to the project. Nothing is uploaded.
exports.linkFiles = catchAsync(async (req, res, next) => {
  let project = await loadProject(req.params.id, next);
  if (!project) return;
  if (!storage.isConfigured()) return next(new AppError("Cloudflare R2 is not configured yet.", 400));
  const items = Array.isArray(req.body.files) ? req.body.files : [];
  if (!items.length) return next(new AppError("Choose at least one file to link.", 400));

  for (const item of items) {
    const key = String(item.key || "").replace(/^\/+/, "");
    if (!key || project.files.some((f) => f.key === key)) continue;
    const meta = await storage.head(key);
    if (!meta) return next(new AppError(`${key} was not found in R2.`, 404));
    if (!ClientProject.FILE_CATEGORIES.includes(item.category)) {
      return next(new AppError(`Choose what kind of document ${key.split("/").pop()} is.`, 400));
    }
    const cat = item.category;
    const blocked = rules.docBlocker(cat, await readinessOf(project));
    if (blocked) return next(new AppError(blocked, 400));
    project = await ClientProject.addFile(project.id, {
      key,
      name: item.name || key.split("/").pop().replace(/^\d{10,}-/, ""),
      category: cat,
      size: meta.size,
      content_type: meta.contentType,
      version: nextVersion(project, cat),
      source: "linked",
    });
    if (cat === "signed_contract") {
      project = await advance(project, "signed");
      project = await settleStage(project);
    }
  }
  res.status(200).json({ status: "success", data: project });
});

// Email the client at any time with files already on the project attached
// (read from R2, so nothing is re-uploaded). Does not touch the project stage.
exports.emailClient = catchAsync(async (req, res, next) => {
  const project = await loadProject(req.params.id, next);
  if (!project) return;
  const { to, subject, message, file_ids = [] } = req.body;
  if (!to || !String(to).trim()) return next(new AppError("Add the client's email address.", 400));
  if (!subject || !String(subject).trim()) return next(new AppError("Add a subject.", 400));

  const files = project.files.filter((f) => file_ids.includes(f.id));
  if (files.length && !storage.isConfigured()) return next(new AppError("Cloudflare R2 is not configured yet.", 400));
  const total = files.reduce((s, f) => s + (f.size || 0), 0);
  if (total > 35 * 1024 * 1024) return next(new AppError("Attachments are over the 35 MB email limit. Send fewer files.", 400));

  const attachments = await Promise.all(files.map(async (f) => ({ filename: f.name, content: await storage.getBuffer(f.key) })));
  await mail.sendClientDocument({ brand: project.brand, to: String(to).trim(), subject, message: message || "", attachments });
  res.status(200).json({ status: "success", sent: attachments.length });
});

exports.advance = advance;
exports.settleStage = settleStage;
