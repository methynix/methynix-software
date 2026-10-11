const mongoose = require("mongoose");
const { allocate } = require("../config/finance");

// "development" money is Methynix revenue and is split into savings /
// mastercard / expenses. "production" money (hosting, domains, store fees) is
// passed straight to providers, so it is recorded but never counted as revenue.
const KINDS = ["development", "production"];

const paymentSchema = new mongoose.Schema({
  project_id: { type: String, default: null },
  project_name: { type: String, default: "" },
  client_name: { type: String, default: "" },
  kind: { type: String, enum: KINDS, default: "development" },
  amount: { type: Number, required: true },
  is_deposit: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  method: { type: String, default: "" },
  reference: { type: String, default: "" },
  note: { type: String, default: "" },
  // Split is stored at the time of payment so changing the ratios later never
  // rewrites history.
  allocation: {
    savings: { type: Number, default: 0 },
    mastercard: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
  },
  receipt_doc_id: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

const serialize = (d) => ({
  id: d._id.toString(),
  project_id: d.project_id,
  project_name: d.project_name || "",
  client_name: d.client_name || "",
  kind: d.kind,
  amount: d.amount,
  is_deposit: Boolean(d.is_deposit),
  date: d.date,
  method: d.method || "",
  reference: d.reference || "",
  note: d.note || "",
  allocation: d.allocation || { savings: 0, mastercard: 0, expenses: 0 },
  receipt_doc_id: d.receipt_doc_id,
  created_at: d.created_at,
});

const zero = { savings: 0, mastercard: 0, expenses: 0 };

exports.KINDS = KINDS;

exports.all = async (filter = {}) => {
  const query = {};
  if (filter.project_id) query.project_id = filter.project_id;
  const docs = await Payment.find(query).sort({ date: -1, created_at: -1 }).lean();
  return docs.map(serialize);
};

exports.create = async (input) => {
  const kind = KINDS.includes(input.kind) ? input.kind : "development";
  const amount = Math.max(Number(input.amount) || 0, 0);
  const doc = await Payment.create({
    project_id: input.project_id || null,
    project_name: input.project_name || "",
    client_name: input.client_name || "",
    kind,
    amount,
    is_deposit: Boolean(input.is_deposit),
    date: input.date || new Date(),
    method: input.method || "",
    reference: input.reference || "",
    note: input.note || "",
    allocation: kind === "development" ? allocate(amount) : zero,
  });
  return serialize(doc);
};

exports.update = async (id, input) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Payment.findById(id);
  if (!doc) return null;
  ["date", "method", "reference", "note", "is_deposit", "receipt_doc_id"].forEach((k) => {
    if (input[k] !== undefined) doc[k] = input[k];
  });
  if (input.kind !== undefined && KINDS.includes(input.kind)) doc.kind = input.kind;
  if (input.amount !== undefined) doc.amount = Math.max(Number(input.amount) || 0, 0);
  doc.allocation = doc.kind === "development" ? allocate(doc.amount) : zero;
  await doc.save();
  return serialize(doc);
};

exports.remove = async (id) => {
  await Payment.findByIdAndDelete(id);
};
