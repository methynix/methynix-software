const Project = require("../models/projectModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.list = catchAsync(async (req, res) => {
  const data = await Project.all();
  res.status(200).json({ status: "success", data });
});

exports.create = catchAsync(async (req, res, next) => {
  if (!req.body.name || !String(req.body.name).trim()) {
    return next(new AppError("Add a project name.", 400));
  }
  const data = await Project.create(req.body);
  res.status(201).json({ status: "success", data });
});

exports.remove = catchAsync(async (req, res) => {
  await Project.remove(req.params.id);
  res.status(200).json({ status: "success" });
});
