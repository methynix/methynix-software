const Post = require("../models/postModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.list = catchAsync(async (req, res) => {
  const data = await Post.all();
  res.status(200).json({ status: "success", data });
});

exports.create = catchAsync(async (req, res, next) => {
  if (!req.body.title || !String(req.body.title).trim()) {
    return next(new AppError("Add a post title.", 400));
  }
  if (!req.body.body || !String(req.body.body).trim()) {
    return next(new AppError("Add some text for the post.", 400));
  }
  const data = await Post.create(req.body);
  res.status(201).json({ status: "success", data });
});

exports.remove = catchAsync(async (req, res) => {
  await Post.remove(req.params.id);
  res.status(200).json({ status: "success" });
});
