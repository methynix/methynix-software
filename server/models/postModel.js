const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image_url: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

const serialize = (d) => ({
  id: d._id.toString(),
  title: d.title,
  body: d.body,
  image_url: d.image_url ?? null,
  created_at: d.created_at,
});

exports.all = async () => {
  const docs = await Post.find().sort({ created_at: -1 }).lean();
  return docs.map(serialize);
};

exports.create = async ({ title, body, image_url }) => {
  const doc = await Post.create({ title, body, image_url: image_url || null });
  return serialize(doc);
};

exports.remove = async (id) => {
  await Post.findByIdAndDelete(id);
};
