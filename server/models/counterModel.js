const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// Atomically bump and return the next sequence value for a given key.
exports.next = async (key) => {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc.seq;
};

// Peek at the next value without consuming it.
exports.peek = async (key) => {
  const doc = await Counter.findOne({ key }).lean();
  return (doc ? doc.seq : 0) + 1;
};

exports.model = Counter;
