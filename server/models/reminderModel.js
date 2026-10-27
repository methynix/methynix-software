const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true },
  due_date: { type: Date, required: true },
  recipient: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: "methodhelen@gmail.com",
  },
  sender: {
    type: String,
    trim: true,
    default: "info@methynix.com",
  },
  status: {
    type: String,
    enum: ["pending", "sent", "cancelled"],
    default: "pending",
  },
  sent_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Reminder = mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);

const serialize = (d) => ({
  id: d._id.toString(),
  title: d.title,
  body: d.body,
  due_date: d.due_date,
  recipient: d.recipient,
  sender: d.sender,
  status: d.status,
  sent_at: d.sent_at,
  created_at: d.created_at,
  updated_at: d.updated_at,
});

exports.model = Reminder;

exports.all = async (filter = {}) => {
  const query = {};
  if (filter.status) query.status = filter.status;
  const docs = await Reminder.find(query).sort({ status: -1, due_date: 1, created_at: -1 }).lean();
  return docs.map(serialize);
};

exports.findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Reminder.findById(id).lean();
  return doc ? serialize(doc) : null;
};

exports.create = async ({ title, body, due_date, recipient, sender }) => {
  const doc = await Reminder.create({
    title,
    body,
    due_date: new Date(due_date),
    recipient: recipient ? recipient.trim().toLowerCase() : "methodhelen@gmail.com",
    sender: sender || "info@methynix.com",
    status: "pending",
  });
  return serialize(doc);
};

exports.update = async (id, patch) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const updateData = { updated_at: new Date() };

  if (patch.title !== undefined) updateData.title = patch.title;
  if (patch.body !== undefined) updateData.body = patch.body;
  if (patch.due_date !== undefined) updateData.due_date = new Date(patch.due_date);
  if (patch.recipient !== undefined) updateData.recipient = patch.recipient.trim().toLowerCase();
  if (patch.sender !== undefined) updateData.sender = patch.sender;
  if (patch.status !== undefined) updateData.status = patch.status;
  if (patch.sent_at !== undefined) updateData.sent_at = patch.sent_at;

  const doc = await Reminder.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return doc ? serialize(doc) : null;
};

exports.remove = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Reminder.findByIdAndDelete(id);
};

exports.markSent = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Reminder.findByIdAndUpdate(
    id,
    { status: "sent", sent_at: new Date(), updated_at: new Date() },
    { new: true }
  ).lean();
  return doc ? serialize(doc) : null;
};

