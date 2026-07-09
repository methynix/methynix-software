const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

exports.model = Admin;

exports.findByEmail = async (email) => {
  const doc = await Admin.findOne({ email: email.toLowerCase() }).lean();
  if (!doc) return null;
  return { id: doc._id.toString(), email: doc.email, password_hash: doc.password_hash };
};
