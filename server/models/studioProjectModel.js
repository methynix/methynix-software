const mongoose = require("mongoose");
const crudModel = require("../utils/crudModel");

// Methynix's own projects. Client work lives in the pipeline
// (clientProjectModel); these are the company's mother projects and hobbies.
const CATEGORIES = ["mother", "hobby"];
const STATUSES = ["idea", "planning", "in_progress", "paused", "done"];

const studioProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: CATEGORIES, default: "mother" },
  status: { type: String, enum: STATUSES, default: "idea" },
  description: { type: String, default: "" },
  url: { type: String, default: "" },
  deadline: { type: Date, default: null },
  reminders_sent: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const StudioProject = mongoose.models.StudioProject || mongoose.model("StudioProject", studioProjectSchema);

module.exports = {
  CATEGORIES,
  STATUSES,
  ...crudModel(StudioProject, {
    fields: ["name", "category", "status", "description", "url", "deadline"],
    sort: { updated_at: -1 },
  }),
};
