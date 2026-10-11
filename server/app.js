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

// The admin API receives PDFs, uploads and documents with embedded diagrams
// as base64, so it gets a much larger body limit than the public routes.
app.use("/api/v1/admin", express.json({ limit: "30mb" }));
app.use(express.json({ limit: "3mb" }));

const publicLimiter = rateLimit({
  max: 60,
  windowMs: 15 * 60 * 1000,
  message: { status: "fail", message: "Too many requests. Please try again later." },
});
// The signed-in dashboard makes many requests per page, so it gets a roomier
// budget. Login has its own strict limiter in adminRoutes.
const adminLimiter = rateLimit({
  max: 1500,
  windowMs: 15 * 60 * 1000,
  message: { status: "fail", message: "Too many requests. Please slow down a little." },
});
app.use("/api", (req, res, next) =>
  (req.path.startsWith("/v1/admin") ? adminLimiter : publicLimiter)(req, res, next)
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1", apiRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} was not found.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
