const mongoose = require("mongoose");
const Counter = require("./counterModel");

const DOC_TYPES = ["invoice", "receipt", "contract"];

// How each document type's reference number is formatted.
const NUMBER_CONFIG = {
  invoice: { prefix: "MTX-", pad: 4 },
  receipt: { prefix: "MTX-R", pad: 4 },
  contract: { prefix: "MTX-C", pad: 4 },
};

const documentSchema = new mongoose.Schema({
  type: { type: String, enum: DOC_TYPES, required: true },
  number: { type: String, required: true, unique: true },
  seq: { type: Number },
  title: { type: String, default: "" },
  client: {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  // Full form payload (line items, stage table, payment method, signatures as
  // data URLs, dates, etc.). Shape varies by document type.
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  total: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["draft", "sent", "paid", "signed", "void"],
    default: "draft",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const DocumentModel = mongoose.models.Document || mongoose.model("Document", documentSchema);

const formatNumber = (type, seq) => {
  const cfg = NUMBER_CONFIG[type] || { prefix: "MTX-", pad: 4 };
  return `${cfg.prefix}${String(seq).padStart(cfg.pad, "0")}`;
};

const serialize = (d) => ({
  id: d._id.toString(),
  type: d.type,
  number: d.number,
  seq: d.seq,
  title: d.title || "",
  client: {
    name: d.client?.name || "",
    email: d.client?.email || "",
    phone: d.client?.phone || "",
    address: d.client?.address || "",
  },
  data: d.data || {},
  total: d.total || 0,
  status: d.status,
  created_at: d.created_at,
  updated_at: d.updated_at,
});

exports.DOC_TYPES = DOC_TYPES;

exports.nextNumber = async (type) => {
  const seq = await Counter.peek(type);
  return { seq, number: formatNumber(type, seq) };
};

exports.all = async (filter = {}) => {
  const query = {};
  if (filter.type && DOC_TYPES.includes(filter.type)) query.type = filter.type;
  const docs = await DocumentModel.find(query).sort({ created_at: -1 }).lean();
  return docs.map(serialize);
};

exports.findById = async (id) => {
  const doc = await DocumentModel.findById(id).lean();
  return doc ? serialize(doc) : null;
};

exports.create = async ({ type, title, client, data, total, status }) => {
  const seq = await Counter.next(type);
  const number = formatNumber(type, seq);
  const doc = await DocumentModel.create({
    type,
    number,
    seq,
    title: title || "",
    client: client || {},
    data: data || {},
    total: total || 0,
    status: status || "draft",
  });
  return serialize(doc);
};

exports.update = async (id, { title, client, data, total, status }) => {
  const patch = { updated_at: new Date() };
  if (title !== undefined) patch.title = title;
  if (client !== undefined) patch.client = client;
  if (data !== undefined) patch.data = data;
  if (total !== undefined) patch.total = total;
  if (status !== undefined) patch.status = status;

  const doc = await DocumentModel.findByIdAndUpdate(id, patch, { new: true }).lean();
  return doc ? serialize(doc) : null;
};

exports.remove = async (id) => {
  await DocumentModel.findByIdAndDelete(id);
};
