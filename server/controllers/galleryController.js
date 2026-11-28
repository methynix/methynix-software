const Gallery = require("../models/galleryModel");
const storage = require("../services/storageService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const need = (next) => {
  if (storage.isConfigured()) return true;
  next(new AppError("Cloudflare R2 is not configured yet.", 400));
  return false;
};

const load = async (id, next) => {
  const item = await Gallery.findById(id);
  if (!item) next(new AppError("File not found.", 404));
  return item;
};

exports.list = catchAsync(async (req, res) => {
  const items = await Gallery.all();
  // Signing is a local calculation, so thumbnails cost nothing extra.
  const data = storage.isConfigured()
    ? await Promise.all(items.map(async (i) => (i.content_type.startsWith("image/") ? { ...i, preview_url: await storage.gallery.signedUrl(i.key, i.name) } : i)))
    : items;
  res.status(200).json({ status: "success", data });
});

exports.upload = catchAsync(async (req, res, next) => {
  if (!need(next)) return;
  const { filename, content_type, data, album } = req.body;
  if (!filename || !data) return next(new AppError("Choose a file to upload.", 400));
  const body = Buffer.from(String(data).replace(/^data:[^;]+;base64,/, ""), "base64");
  const key = await storage.gallery.upload({ filename, body, contentType: content_type });
  const item = await Gallery.create({ key, name: filename, album: String(album || "").trim(), size: body.length, content_type: content_type || "" });
  res.status(201).json({ status: "success", data: item });
});

// Files already sitting in the bucket that the gallery does not know about yet.
exports.unlinked = catchAsync(async (req, res, next) => {
  if (!need(next)) return;
  const known = await Gallery.keys();
  const data = (await storage.gallery.list()).filter((o) => !known.has(o.key));
  res.status(200).json({ status: "success", data });
});

exports.link = catchAsync(async (req, res, next) => {
  if (!need(next)) return;
  const keys = Array.isArray(req.body.keys) ? req.body.keys : [];
  if (!keys.length) return next(new AppError("Choose at least one file.", 400));
  const known = await Gallery.keys();
  const added = [];
  for (const raw of keys) {
    const key = String(raw).replace(/^\/+/, "");
    if (!key || known.has(key)) continue;
    const meta = await storage.gallery.head(key);
    if (!meta) return next(new AppError(`${key} was not found in the bucket.`, 404));
    added.push(
      await Gallery.create({
        key,
        name: key.split("/").pop().replace(/^\d{10,}-/, ""),
        album: String(req.body.album || "").trim(),
        size: meta.size,
        content_type: meta.contentType,
        imported: true,
      })
    );
  }
  res.status(200).json({ status: "success", data: added });
});

exports.url = catchAsync(async (req, res, next) => {
  if (!need(next)) return;
  const item = await load(req.params.id, next);
  if (!item) return;
  const url = await storage.gallery.signedUrl(item.key, item.name, req.query.download === "1");
  res.status(200).json({ status: "success", url });
});

exports.update = catchAsync(async (req, res, next) => {
  const data = await Gallery.update(req.params.id, req.body);
  if (!data) return next(new AppError("File not found.", 404));
  res.status(200).json({ status: "success", data });
});

exports.remove = catchAsync(async (req, res, next) => {
  const item = await load(req.params.id, next);
  if (!item) return;
  if (!item.imported && storage.isConfigured()) await storage.gallery.remove(item.key);
  await Gallery.remove(item.id);
  res.status(200).json({ status: "success" });
});
