const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: "site", unique: true },
  maintenance: { type: Boolean, default: false },
  updated_at: { type: Date, default: Date.now },
});

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

exports.get = async () => {
  const doc = await Settings.findOne({ key: "site" }).lean();
  return { maintenance: doc ? doc.maintenance : false };
};

exports.setMaintenance = async (value) => {
  const doc = await Settings.findOneAndUpdate(
    { key: "site" },
    { maintenance: Boolean(value), updated_at: new Date() },
    { new: true, upsert: true }
  ).lean();
  return { maintenance: doc.maintenance };
};
