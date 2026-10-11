const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// List/create/update/remove handlers for a model built with utils/crudModel.
module.exports = (Model, { label, required = [] }) => ({
  list: catchAsync(async (req, res) => {
    const data = await Model.all();
    res.status(200).json({ status: "success", data });
  }),

  create: catchAsync(async (req, res, next) => {
    const missing = required.find((k) => !req.body[k] || !String(req.body[k]).trim());
    if (missing) return next(new AppError(`Add a ${missing} for the ${label}.`, 400));
    const data = await Model.create(req.body);
    res.status(201).json({ status: "success", data });
  }),

  update: catchAsync(async (req, res, next) => {
    const data = await Model.update(req.params.id, req.body);
    if (!data) return next(new AppError(`That ${label} was not found.`, 404));
    res.status(200).json({ status: "success", data });
  }),

  remove: catchAsync(async (req, res) => {
    await Model.remove(req.params.id);
    res.status(200).json({ status: "success" });
  }),
});
