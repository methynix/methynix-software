const mongoose = require("mongoose");
const { allocate } = require("../config/finance");
const Settings = require("./settingsModel");

// "development" money is Methynix revenue and is split into savings /
// mastercard / expenses. "production" money (hosting, domains, store fees) is
// passed straight to providers, so it is recorded but never counted as revenue.
const KINDS = ["development", "production"];
// What a development payment is for: the upfront deposit, the remaining
// balance, the whole price at once, or any other instalment.
const STAGES = ["deposit", "balance", "full", "installment"];

const paymentSchema = new mongoose.Schema({
  project_id: { type: String, default: null },
  project_name: { type: String, default: "" },
  client_name: { type: String, default: "" },
  kind: { type: String, enum: KINDS, default: "development" },
  amount: { type: Number, required: true },
  is_deposit: { type: Boolean, default: false },
  stage: { type: String, enum: [...STAGES, ""], default: "" },
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
  stage: d.stage || (d.is_deposit ? "deposit" : ""),
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
exports.STAGES = STAGES;

exports.all = async (filter = {}) => {
  const query = {};
  if (filter.project_id && typeof filter.project_id === "string") query.project_id = filter.project_id;
  const docs = await Payment.find(query).sort({ date: -1, created_at: -1 }).lean();
  return docs.map(serialize);
};

exports.findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Payment.findById(id).lean();
  return doc ? serialize(doc) : null;
};

exports.create = async (input) => {
  const kind = KINDS.includes(input.kind) ? input.kind : "development";
  const amount = Math.max(Number(input.amount) || 0, 0);
  const stage = kind === "development" && STAGES.includes(input.stage) ? input.stage : "";
  // The split in force today is stored on the payment, so later changes in
  // Settings never rewrite what was already recorded.
  const { split } = await Settings.getFinance();
  const doc = await Payment.create({
    project_id: input.project_id || null,
    project_name: input.project_name || "",
    client_name: input.client_name || "",
    kind,
    amount,
    is_deposit: stage ? stage === "deposit" : Boolean(input.is_deposit),
    stage,
    date: input.date || new Date(),
    method: input.method || "",
    reference: input.reference || "",
    note: input.note || "",
    allocation: kind === "development" ? allocate(amount, split) : zero,
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
  const before = { kind: doc.kind, amount: doc.amount, allocation: doc.allocation };
  if (input.kind !== undefined && KINDS.includes(input.kind)) doc.kind = input.kind;
  if (input.amount !== undefined) doc.amount = Math.max(Number(input.amount) || 0, 0);
  if (input.stage !== undefined && STAGES.includes(input.stage)) {
    doc.stage = input.stage;
    doc.is_deposit = input.stage === "deposit";
  }
  if (doc.kind !== "development") {
    doc.allocation = zero;
  } else if (doc.kind !== before.kind || doc.amount !== before.amount) {
    // Keep the ratios this payment was originally recorded with when only the
    // amount changes; use today's settings if it was not a revenue payment.
    const old = before.allocation || zero;
    const oldTotal = (old.savings || 0) + (old.mastercard || 0) + (old.expenses || 0);
    const split =
      before.kind === "development" && oldTotal > 0
        ? { savings: old.savings / oldTotal, mastercard: old.mastercard / oldTotal, expenses: old.expenses / oldTotal }
        : (await Settings.getFinance()).split;
    doc.allocation = allocate(doc.amount, split);
  }
  await doc.save();
  return serialize(doc);
};

exports.remove = async (id) => {
  await Payment.findByIdAndDelete(id);
};
