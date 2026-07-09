const DocumentModel = require("../models/documentModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const isValidType = (type) => DocumentModel.DOC_TYPES.includes(type);

exports.list = catchAsync(async (req, res) => {
  const data = await DocumentModel.all({ type: req.query.type });
  res.status(200).json({ status: "success", data });
});

exports.nextNumber = catchAsync(async (req, res, next) => {
  const type = req.query.type;
  if (!isValidType(type)) {
    return next(new AppError("Choose a valid document type.", 400));
  }
  const data = await DocumentModel.nextNumber(type);
  res.status(200).json({ status: "success", data });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const doc = await DocumentModel.findById(req.params.id);
  if (!doc) return next(new AppError("Document not found.", 404));
  res.status(200).json({ status: "success", data: doc });
});

exports.create = catchAsync(async (req, res, next) => {
  const { type } = req.body;
  if (!isValidType(type)) {
    return next(new AppError("Choose a valid document type.", 400));
  }
  const data = await DocumentModel.create(req.body);
  res.status(201).json({ status: "success", data });
});

exports.update = catchAsync(async (req, res, next) => {
  const doc = await DocumentModel.update(req.params.id, req.body);
  if (!doc) return next(new AppError("Document not found.", 404));
  res.status(200).json({ status: "success", data: doc });
});

exports.remove = catchAsync(async (req, res) => {
  await DocumentModel.remove(req.params.id);
  res.status(200).json({ status: "success" });
});
