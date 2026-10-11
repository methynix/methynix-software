const mongoose = require("mongoose");
const crudModel = require("../utils/crudModel");

const noteSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  body: { type: String, default: "" },
  pinned: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

module.exports = crudModel(Note, {
  fields: ["title", "body", "pinned"],
  sort: { pinned: -1, updated_at: -1 },
});
