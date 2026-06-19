const Message = require("../models/messageModel");
const { sendContactEmail } = require("../services/mailService");
const catchAsync = require("../utils/catchAsync");

exports.submit = catchAsync(async (req, res) => {
  const { name, email, phone, need, message } = req.body;

  await Message.create({ name, email, phone, need, message });

  try {
    await sendContactEmail({ name, email, phone, need, message });
  } catch (err) {
    console.error("Email delivery failed:", err.message);
  }

  res.status(201).json({
    status: "success",
    message: "Thanks. Your message has been received.",
  });
});
