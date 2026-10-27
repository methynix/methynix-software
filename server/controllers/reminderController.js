const Reminder = require("../models/reminderModel");
const reminders = require("../services/reminderService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.list = catchAsync(async (req, res) => {
  const data = await Reminder.all({ status: req.query.status });
  res.status(200).json({ status: "success", data });
});

exports.create = catchAsync(async (req, res, next) => {
  const { title, body, due_date, recipient, sender } = req.body;

  if (!title || !String(title).trim()) {
    return next(new AppError("Please add a title for the reminder.", 400));
  }
  if (!body || !String(body).trim()) {
    return next(new AppError("Please add the body of the reminder email.", 400));
  }
  if (!due_date || isNaN(new Date(due_date).getTime())) {
    return next(new AppError("Please provide a valid date for the reminder.", 400));
  }

  const dueDateObj = new Date(due_date);

  const data = await Reminder.create({
    title: String(title).trim(),
    body: String(body).trim(),
    due_date: dueDateObj,
    recipient: recipient ? String(recipient).trim() : "methodhelen@gmail.com",
    sender: sender ? String(sender).trim() : "info@methynix.com",
  });

  // If scheduled for now or the past, trigger automatic dispatch immediately
  if (dueDateObj <= new Date()) {
    reminders.processCustomReminders().catch((err) =>
      console.error("[AUTOMATIC_REMINDER] Immediate dispatch failed:", err.message)
    );
  }

  res.status(201).json({
    status: "success",
    message: `Reminder scheduled. An email will automatically be sent to ${data.recipient} on the scheduled date.`,
    data,
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const data = await Reminder.findById(req.params.id);
  if (!data) return next(new AppError("Reminder not found.", 404));
  res.status(200).json({ status: "success", data });
});

exports.update = catchAsync(async (req, res, next) => {
  const data = await Reminder.update(req.params.id, req.body);
  if (!data) return next(new AppError("Reminder not found.", 404));

  if (data.status === "pending" && new Date(data.due_date) <= new Date()) {
    reminders.processCustomReminders().catch((err) =>
      console.error("[AUTOMATIC_REMINDER] Immediate dispatch failed:", err.message)
    );
  }

  res.status(200).json({ status: "success", data });
});

exports.remove = catchAsync(async (req, res) => {
  await Reminder.remove(req.params.id);
  res.status(200).json({ status: "success" });
});

exports.sendNow = catchAsync(async (req, res, next) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) return next(new AppError("Reminder not found.", 404));

  const updated = await reminders.sendSingleNow(reminder.id);
  res.status(200).json({
    status: "success",
    message: `Reminder email sent to ${reminder.recipient}.`,
    data: updated,
  });
});
