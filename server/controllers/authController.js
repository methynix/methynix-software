const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/adminModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Enter your email and password.", 400));
  }

  const admin = await Admin.findByEmail(email);
  const ok = admin && (await bcrypt.compare(password, admin.password_hash));

  if (!ok) {
    return next(new AppError("Email or password is incorrect.", 401));
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({ status: "success", token });
});
