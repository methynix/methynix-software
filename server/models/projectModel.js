const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: "web" },
  summary: { type: String, default: null },
  url: { type: String, default: null },
  image_url: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

const serialize = (d) => ({
  id: d._id.toString(),
  name: d.name,
  type: d.type,
  summary: d.summary ?? null,
  url: d.url ?? null,
  image_url: d.image_url ?? null,
  created_at: d.created_at,
});

exports.all = async () => {
  const docs = await Project.find().sort({ created_at: -1 }).lean();
  return docs.map(serialize);
};

exports.create = async ({ name, type, summary, url, image_url }) => {
  const doc = await Project.create({
    name,
    type: type || "web",
    summary: summary || null,
    url: url || null,
    image_url: image_url || null,
  });
  return serialize(doc);
};

exports.remove = async (id) => {
  await Project.findByIdAndDelete(id);
};
