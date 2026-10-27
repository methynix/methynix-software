const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/adminModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// A fixed dummy hash used for constant-time comparison when an email is not found
const DUMMY_HASH = "$2a$12$e8x5a31qB6K.1FkHsujAiuI6p1iI7t9D7c1F0oT0wO4O6/F0w0mOW";

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return next(new AppError("Enter your email and password.", 400));
  }

  const admin = await Admin.findByEmail(email);
  const hashToCompare = admin ? admin.password_hash : DUMMY_HASH;
  const ok = await bcrypt.compare(password, hashToCompare);

  if (!admin || !ok) {
    return next(new AppError("Email or password is incorrect.", 401));
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    status: "success",
    token,
    admin: { email: admin.email },
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError("Please provide both current and new passwords.", 400));
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    return next(new AppError("New passwords do not match.", 400));
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return next(new AppError("New password must be at least 8 characters long.", 400));
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    return next(new AppError("Admin account not found.", 404));
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!isCurrentValid) {
    return next(new AppError("Current password is incorrect.", 401));
  }

  if (currentPassword === newPassword) {
    return next(new AppError("New password must be different from current password.", 400));
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await Admin.updatePassword(admin.id, newHash);

  // Issue a fresh token
  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    status: "success",
    message: "Password changed successfully.",
    token,
  });
});
