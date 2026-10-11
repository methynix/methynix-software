const mongoose = require("mongoose");
const crudModel = require("../utils/crudModel");

// Things Methynix pays to keep running: domains, hosting, VPSs and API
// subscriptions. `expires_at` drives the renewal reminders.
const KINDS = ["domain", "hosting", "vps", "api", "subscription", "other"];

const infrastructureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  kind: { type: String, enum: KINDS, default: "domain" },
  provider: { type: String, default: "" },
  owner: { type: String, default: "methynix" }, // "methynix" or a client name
  cost: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  billing_cycle: { type: String, default: "yearly" },
  expires_at: { type: Date, default: null },
  auto_renew: { type: Boolean, default: false },
  url: { type: String, default: "" },
  notes: { type: String, default: "" },
  reminders_sent: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Infrastructure =
  mongoose.models.Infrastructure || mongoose.model("Infrastructure", infrastructureSchema);

module.exports = {
  KINDS,
  ...crudModel(Infrastructure, {
    fields: ["name", "kind", "provider", "owner", "cost", "currency", "billing_cycle", "expires_at", "auto_renew", "url", "notes"],
    sort: { expires_at: 1 },
  }),
};
