const storage = require("../services/storageService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const decodeBase64 = (value = "") =>
  Buffer.from(String(value).replace(/^data:[^;]+;base64,/, ""), "base64");

const getMimeType = (dataUrl = "", fallback = "image/jpeg") => {
  const match = String(dataUrl).match(/^data:([^;]+);base64,/);
  return match ? match[1] : fallback;
};

exports.uploadImage = catchAsync(async (req, res, next) => {
  if (!storage.isConfigured()) {
    return next(
      new AppError(
        "Cloudflare R2 is not configured yet. Please ensure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are added to server/.env.",
        400
      )
    );
  }

  const { data, filename, folder = "methynix-website (new)", contentType } = req.body;
  if (!data) {
    return next(new AppError("Choose an image to upload.", 400));
  }

  const name = filename || `image-${Date.now()}.png`;
  const mime = contentType || getMimeType(data, "image/png");
  const body = decodeBase64(data);

  if (!body || body.length === 0) {
    return next(new AppError("Invalid or empty image file.", 400));
  }

  // Max 20MB
  if (body.length > 20 * 1024 * 1024) {
    return next(new AppError("Image is too large. Maximum size is 20MB.", 400));
  }

  const key = await storage.upload({
    folder: folder || "methynix-website (new)",
    filename: name,
    body,
    contentType: mime,
  });

  const url = storage.publicUrl(key);

  res.status(201).json({
    status: "success",
    data: {
      key,
      url,
      filename: name,
      size: body.length,
      contentType: mime,
    },
  });
});

