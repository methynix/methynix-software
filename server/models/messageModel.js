const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  need: { type: String, default: null },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

exports.create = async ({ name, email, phone, need, message }) => {
  const doc = await Message.create({
    name,
    email,
    phone: phone || null,
    need: need || null,
    message,
  });
  return { id: doc._id.toString() };
};
