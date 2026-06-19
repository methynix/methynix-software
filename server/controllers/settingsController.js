const Settings = require("../models/settingsModel");
const catchAsync = require("../utils/catchAsync");

exports.status = catchAsync(async (req, res) => {
  const settings = await Settings.get();
  res.status(200).json({ status: "success", maintenance: settings.maintenance });
});

exports.setMaintenance = catchAsync(async (req, res) => {
  const settings = await Settings.setMaintenance(req.body.maintenance);
  res.status(200).json({ status: "success", maintenance: settings.maintenance });
});
