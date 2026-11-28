const mongoose = require("mongoose");
const { SPLIT, DEPOSIT_RATE } = require("../config/finance");

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: "site", unique: true },
  maintenance: { type: Boolean, default: false },
  // How each development payment is divided, in percent (must total 100).
  split_percent: {
    savings: { type: Number },
    mastercard: { type: Number },
    expenses: { type: Number },
  },
  // Share of the price a client pays up front. Copied onto each new project.
  deposit_percent: { type: Number },
  // Net money sitting in the bank that is set aside for future plans.
  bank_balance: { type: Number, default: 0 },
  bank_balance_updated_at: { type: Date, default: null },
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

const pct = (v, fallback) => (Number.isFinite(v) ? v : fallback);

const shape = (doc) => {
  const sp = doc?.split_percent || {};
  const split_percent = {
    savings: pct(sp.savings, SPLIT.savings * 100),
    mastercard: pct(sp.mastercard, SPLIT.mastercard * 100),
    expenses: pct(sp.expenses, SPLIT.expenses * 100),
  };
  const deposit_percent = pct(doc?.deposit_percent, DEPOSIT_RATE * 100);
  return {
    split_percent,
    split: {
      savings: split_percent.savings / 100,
      mastercard: split_percent.mastercard / 100,
      expenses: split_percent.expenses / 100,
    },
    deposit_percent,
    deposit_rate: deposit_percent / 100,
    bank_balance: doc?.bank_balance || 0,
    bank_balance_updated_at: doc?.bank_balance_updated_at || null,
  };
};

exports.getFinance = async () => shape(await Settings.findOne({ key: "site" }).lean());

// Throws a plain Error with a readable message when the input is not valid.
exports.setFinance = async (input = {}) => {
  const patch = { updated_at: new Date() };

  if (input.split_percent !== undefined) {
    const s = input.split_percent || {};
    const vals = ["savings", "mastercard", "expenses"].map((k) => Number(s[k]));
    if (vals.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) throw new Error("Each share must be a number between 0 and 100.");
    const total = vals.reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 0.001) throw new Error(`The three shares must add up to 100%. They add up to ${Math.round(total * 100) / 100}%.`);
    patch.split_percent = { savings: vals[0], mastercard: vals[1], expenses: vals[2] };
  }

  if (input.deposit_percent !== undefined) {
    const d = Number(input.deposit_percent);
    if (!Number.isFinite(d) || d < 0 || d > 100) throw new Error("The deposit must be between 0 and 100%.");
    patch.deposit_percent = d;
  }

  if (input.bank_balance !== undefined) {
    const b = Number(String(input.bank_balance).replace(/[,\s]/g, ""));
    if (!Number.isFinite(b) || b < 0) throw new Error("Enter the bank balance as a number.");
    patch.bank_balance = b;
    patch.bank_balance_updated_at = new Date();
  }

  const doc = await Settings.findOneAndUpdate({ key: "site" }, patch, { new: true, upsert: true }).lean();
  return shape(doc);
};
