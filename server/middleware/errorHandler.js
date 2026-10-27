const AppError = require("../utils/appError");

module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong on our side. Please try again.";
  let isOperational = err.isOperational === true;

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.length > 0 ? errors.join(" ") : "Invalid input data.";
    isOperational = true;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': ${err.value}`;
    isOperational = true;
  }

  // Handle Mongo duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists.`;
    isOperational = true;
  }

  // Handle bad JSON body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload.";
    isOperational = true;
  }

  // Log non-operational errors
  if (!isOperational || process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", err);
  }

  res.status(statusCode).json({
    status: statusCode < 500 ? "fail" : "error",
    message: isOperational ? message : "Something went wrong on our side. Please try again.",
  });
};
