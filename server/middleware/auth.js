const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const AppError = require("../utils/appError");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Please sign in to do that.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return next(new AppError("Invalid session token. Please sign in again.", 401));
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(new AppError("Admin account no longer exists. Please sign in again.", 401));
    }

    req.admin = { id: admin.id, email: admin.email };
    next();
  } catch (err) {
    return next(new AppError("Your session has expired. Please sign in again.", 401));
  }
};
