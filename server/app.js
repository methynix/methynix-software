const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const apiRoutes = require("./routes");
const globalErrorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/appError");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("This origin is not allowed."));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20kb" }));

const limiter = rateLimit({
  max: 60,
  windowMs: 15 * 60 * 1000,
  message: { status: "fail", message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1", apiRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} was not found.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
