const Settings = require("../models/settingsModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.status = catchAsync(async (req, res) => {
  const settings = await Settings.get();
  res.status(200).json({ status: "success", maintenance: settings.maintenance });
});

exports.setMaintenance = catchAsync(async (req, res) => {
  const settings = await Settings.setMaintenance(req.body.maintenance);
  res.status(200).json({ status: "success", maintenance: settings.maintenance });
});

exports.getFinance = catchAsync(async (req, res) => {
  res.status(200).json({ status: "success", data: await Settings.getFinance() });
});

exports.setFinance = catchAsync(async (req, res, next) => {
  try {
    const data = await Settings.setFinance(req.body);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
});
