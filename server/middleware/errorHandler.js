module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    status: statusCode < 500 ? "fail" : "error",
    message: isOperational ? err.message : "Something went wrong on our side. Please try again.",
  });
};
