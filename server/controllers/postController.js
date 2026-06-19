const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");

exports.list = catchAsync(async (req, res) => {
  const data = await Post.all();
  res.status(200).json({ status: "success", data });
});

exports.create = catchAsync(async (req, res) => {
  const data = await Post.create(req.body);
  res.status(201).json({ status: "success", data });
});

exports.remove = catchAsync(async (req, res) => {
  await Post.remove(req.params.id);
  res.status(200).json({ status: "success" });
});
