const { validationResult } = require("express-validator");
const AppError = require("../utils/appError");

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new AppError(result.array()[0].msg, 400));
  }
  next();
};
