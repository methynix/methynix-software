const Payment = require("../models/paymentModel");
const ClientProject = require("../models/clientProjectModel");
const { advance, settleStage } = require("./clientProjectController");
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
  let stage = Payment.STAGES.includes(req.body.stage) ? req.body.stage : "";
  const isDev = (req.body.kind || "development") === "development";
  if (req.body.project_id) {
    project = await ClientProject.findById(req.body.project_id);
    if (!project) return next(new AppError("Project not found.", 404));
    // Without an explicit type, the first development payment is the deposit
    // and later ones are balance payments.
    if (!stage && isDev) {
      const earlier = await Payment.all({ project_id: project.id });
      stage = earlier.some((p) => p.kind === "development") ? "balance" : "deposit";
    }
  }
  const isDeposit = stage === "deposit";

  const data = await Payment.create({
    ...req.body,
    amount,
    stage,
    is_deposit: isDeposit,
    project_name: project?.name || req.body.project_name || "",
    client_name: project?.client?.name || req.body.client_name || "",
  });

  // A deposit (or full payment) moves a signed project to Deposit paid. Earlier
  // than signed, the money is kept and the stage catches up once it is signed.
  let note = "";
  if (project && data.kind === "development" && ["deposit", "full"].includes(stage)) {
    const fresh = await ClientProject.findById(project.id);
    const moved = await settleStage(fresh);
    if (moved.status === fresh.status && fresh.status !== "deposit_paid" && !fresh.legacy) {
      const order = ClientProject.STATUSES;
      if (order.indexOf(fresh.status) < order.indexOf("signed")) note = "Payment recorded. The project moves to Deposit paid once the contract is signed.";
    }
  }

  res.status(201).json({ status: "success", data, note });
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
