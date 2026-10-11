const Payment = require("../models/paymentModel");
const ClientProject = require("../models/clientProjectModel");
const { advance } = require("./clientProjectController");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.list = catchAsync(async (req, res) => {
  const data = await Payment.all({ project_id: req.query.project_id });
  res.status(200).json({ status: "success", data });
});

exports.create = catchAsync(async (req, res, next) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return next(new AppError("Enter the amount received.", 400));
  }

  let project = null;
  let isDeposit = Boolean(req.body.is_deposit);
  if (req.body.project_id) {
    project = await ClientProject.findById(req.body.project_id);
    if (!project) return next(new AppError("Project not found.", 404));
    // The first development payment on a project is the upfront deposit.
    if (req.body.is_deposit === undefined && (req.body.kind || "development") === "development") {
      const earlier = await Payment.all({ project_id: project.id });
      isDeposit = !earlier.some((p) => p.kind === "development");
    }
  }

  const data = await Payment.create({
    ...req.body,
    amount,
    is_deposit: isDeposit,
    project_name: project?.name || req.body.project_name || "",
    client_name: project?.client?.name || req.body.client_name || "",
  });

  if (project && data.kind === "development" && isDeposit) {
    await advance(project, "deposit_paid");
  }

  res.status(201).json({ status: "success", data });
});

exports.update = catchAsync(async (req, res, next) => {
  const data = await Payment.update(req.params.id, req.body);
  if (!data) return next(new AppError("Payment not found.", 404));
  res.status(200).json({ status: "success", data });
});

exports.remove = catchAsync(async (req, res) => {
  await Payment.remove(req.params.id);
  res.status(200).json({ status: "success" });
});
