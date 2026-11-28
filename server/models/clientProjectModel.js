const mongoose = require("mongoose");

// The sales-to-delivery pipeline. A lead is created when a client first gets in
// touch and moves through these stages until the work is completed.
const STATUSES = [
  "lead",
  "contacted",
  "discovery",
  "proposal_sent",
  "accepted",
  "contract_sent",
  "signed",
  "deposit_paid",
  "in_progress",
  "delivered",
  "completed",
  // Finished projects that are still looked after for a recurring fee/period.
  "maintenance",
  "on_hold",
  "lost",
];

const CLOSED = ["completed", "lost"];

const FILE_CATEGORIES = ["proposal", "contract", "signed_contract", "technical_doc", "receipt", "other"];

const fileSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, enum: FILE_CATEGORIES, default: "other" },
    size: { type: Number, default: 0 },
    content_type: { type: String, default: "" },
    // Proposal / contract / technical documents are versioned: v1, v2, ...
    version: { type: Number, default: null },
    source: { type: String, enum: ["generated", "uploaded", "linked"], default: "uploaded" },
    uploaded_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const BRANDS = ["methynix", "kaspa"];

const clientProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Shared reference number for every document of this project, e.g. the
  // 8 in NTD-0008 (proposal) and CTT-0008 (contract).
  ref_no: { type: Number, default: null },
  // Which brand the documents go out under.
  brand: { type: String, enum: BRANDS, default: "methynix" },
  type: { type: String, default: "web" },
  source: { type: String, default: "" },
  description: { type: String, default: "" },
  client: {
    name: { type: String, default: "" },
    company: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  // Agreed development price in TZS. Production costs are listed separately
  // because the client pays those straight to providers.
  quote: { type: Number, default: 0 },
  production_costs: [
    {
      _id: false,
      item: { type: String, default: "" },
      amount: { type: Number, default: 0 },
      cycle: { type: String, default: "yearly" },
    },
  ],
  // Work finished before this system existed. Kept as a record only: never
  // counted as outstanding, pipeline or revenue, and never emailed about.
  legacy: { type: Boolean, default: false },
  // Deposit share agreed for this project, copied from Settings when it is
  // created so changing Settings later does not alter existing projects.
  deposit_percent: { type: Number, default: null },
  status: { type: String, enum: STATUSES, default: "lead" },
  status_history: [{ _id: false, status: String, at: { type: Date, default: Date.now } }],
  start_date: { type: Date, default: null },
  deadline: { type: Date, default: null },
  completed_at: { type: Date, default: null },
  // Only used while status is "maintenance": when the current maintenance period ends.
  maintenance_deadline: { type: Date, default: null },
  storage_folder: { type: String, required: true, unique: true },
  proposal_doc_id: { type: String, default: null },
  contract_doc_id: { type: String, default: null },
  technical_doc_id: { type: String, default: null },
  files: [fileSchema],
  notes: { type: String, default: "" },
  reminders_sent: [{ type: String }],
  completion_email_sent_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const ClientProject = mongoose.models.ClientProject || mongoose.model("ClientProject", clientProjectSchema);

const serialize = (d) => ({
  id: d._id.toString(),
  name: d.name,
  ref_no: d.ref_no,
  brand: d.brand || "methynix",
  type: d.type,
  source: d.source || "",
  description: d.description || "",
  client: {
    name: d.client?.name || "",
    company: d.client?.company || "",
    email: d.client?.email || "",
    phone: d.client?.phone || "",
    address: d.client?.address || "",
  },
  quote: d.quote || 0,
  production_costs: d.production_costs || [],
  legacy: Boolean(d.legacy),
  deposit_percent: d.deposit_percent ?? 40,
  status: d.status,
  status_history: d.status_history || [],
  start_date: d.start_date,
  deadline: d.deadline,
  completed_at: d.completed_at,
  maintenance_deadline: d.maintenance_deadline || null,
  storage_folder: d.storage_folder,
  proposal_doc_id: d.proposal_doc_id,
  contract_doc_id: d.contract_doc_id,
  technical_doc_id: d.technical_doc_id,
  files: (d.files || []).map((f) => ({
    id: f._id.toString(),
    key: f.key,
    name: f.name,
    category: f.category,
    size: f.size,
    content_type: f.content_type,
    version: f.version || null,
    source: f.source || "uploaded",
    uploaded_at: f.uploaded_at,
  })),
  notes: d.notes || "",
  completion_email_sent_at: d.completion_email_sent_at,
  created_at: d.created_at,
  updated_at: d.updated_at,
});

const EDITABLE = [
  "name", "ref_no", "brand", "type", "source", "description", "client", "quote", "production_costs",
  "start_date", "deadline", "notes", "proposal_doc_id", "contract_doc_id",
  "technical_doc_id", "legacy", "maintenance_deadline", "deposit_percent",
];

exports.STATUSES = STATUSES;
exports.BRANDS = BRANDS;
exports.CLOSED = CLOSED;
exports.FILE_CATEGORIES = FILE_CATEGORIES;
exports.model = ClientProject;

exports.all = async () => {
  const docs = await ClientProject.find().sort({ updated_at: -1 }).lean();
  return docs.map(serialize);
};

exports.findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await ClientProject.findById(id).lean();
  return doc ? serialize(doc) : null;
};

exports.folderTaken = async (folder) => Boolean(await ClientProject.exists({ storage_folder: folder }));

exports.create = async (input, storageFolder) => {
  const patch = { storage_folder: storageFolder, status: STATUSES.includes(input.status) ? input.status : "lead" };
  EDITABLE.forEach((k) => {
    if (input[k] !== undefined) patch[k] = input[k];
  });
  patch.status_history = [{ status: patch.status, at: new Date() }];
  if (patch.status === "completed") patch.completed_at = input.completed_at ? new Date(input.completed_at) : new Date();
  const doc = await ClientProject.create(patch);
  return serialize(doc);
};

exports.update = async (id, input) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await ClientProject.findById(id);
  if (!doc) return null;

  EDITABLE.forEach((k) => {
    if (input[k] !== undefined) doc[k] = input[k];
  });

  if (input.status && STATUSES.includes(input.status) && input.status !== doc.status) {
    doc.status = input.status;
    doc.status_history.push({ status: input.status, at: new Date() });
    if (input.status === "completed") doc.completed_at = new Date();
  }

  doc.updated_at = new Date();
  await doc.save();
  return serialize(doc);
};

exports.markCompletionEmailSent = (id) =>
  ClientProject.findByIdAndUpdate(id, { completion_email_sent_at: new Date() });

exports.addFile = async (id, file) => {
  const doc = await ClientProject.findByIdAndUpdate(
    id,
    { $push: { files: file }, updated_at: new Date() },
    { new: true }
  ).lean();
  return doc ? serialize(doc) : null;
};

exports.removeFile = async (id, fileId) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const query = mongoose.isValidObjectId(fileId)
    ? { _id: new mongoose.Types.ObjectId(String(fileId)) }
    : { _id: fileId };
  const doc = await ClientProject.findByIdAndUpdate(
    id,
    { $pull: { files: query }, updated_at: new Date() },
    { new: true }
  ).lean();
  return doc ? serialize(doc) : null;
};

exports.remove = async (id) => {
  await ClientProject.findByIdAndDelete(id);
};
