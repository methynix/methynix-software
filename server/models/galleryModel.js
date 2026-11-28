const mongoose = require("mongoose");

// Personal files kept in the private gallery bucket. Albums are just a name on
// each item, so renaming or moving never touches R2.
const gallerySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  album: { type: String, default: "" },
  note: { type: String, default: "" },
  size: { type: Number, default: 0 },
  content_type: { type: String, default: "" },
  // Imported items were already in the bucket; removing them only unlinks.
  imported: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);

const serialize = (d) => ({
  id: d._id.toString(),
  key: d.key,
  name: d.name,
  album: d.album || "",
  note: d.note || "",
  size: d.size || 0,
  content_type: d.content_type || "",
  imported: Boolean(d.imported),
  created_at: d.created_at,
});

exports.all = async () => (await Gallery.find().sort({ created_at: -1 }).lean()).map(serialize);
exports.findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const d = await Gallery.findById(id).lean();
  return d ? serialize(d) : null;
};
exports.keys = async () => new Set((await Gallery.find().select("key").lean()).map((d) => d.key));
exports.create = async (input) => serialize(await Gallery.create(input));
exports.update = async (id, input) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const patch = {};
  ["name", "album", "note"].forEach((k) => {
    if (input[k] !== undefined) patch[k] = String(input[k]).trim();
  });
  if (patch.name === "") delete patch.name;
  const d = await Gallery.findByIdAndUpdate(id, patch, { new: true }).lean();
  return d ? serialize(d) : null;
};
exports.remove = async (id) => {
  await Gallery.findByIdAndDelete(id);
};
