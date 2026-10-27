const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

exports.model = Admin;

exports.findByEmail = async (email) => {
  if (!email || typeof email !== "string") return null;
  const doc = await Admin.findOne({ email: email.trim().toLowerCase() }).lean();
  if (!doc) return null;
  return { id: doc._id.toString(), email: doc.email, password_hash: doc.password_hash };
};

exports.findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Admin.findById(id).lean();
  if (!doc) return null;
  return { id: doc._id.toString(), email: doc.email, password_hash: doc.password_hash };
};

exports.updatePassword = async (id, passwordHash) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Admin.findByIdAndUpdate(
    id,
    { password_hash: passwordHash, updated_at: new Date() },
    { new: true }
  ).lean();
  if (!doc) return null;
  return { id: doc._id.toString(), email: doc.email };
};
