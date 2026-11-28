const crypto = require("crypto");
const ClientProject = require("../models/clientProjectModel");
const StudioProject = require("../models/studioProjectModel");
const Infrastructure = require("../models/infrastructureModel");
const Payment = require("../models/paymentModel");
const Reminder = require("../models/reminderModel");
const reminders = require("../services/reminderService");
const Settings = require("../models/settingsModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const DAY = 24 * 60 * 60 * 1000;
const within = (date, days) => date && new Date(date).getTime() - Date.now() <= days * DAY;

const sumBy = (rows, fn) => rows.reduce((s, r) => s + (fn(r) || 0), 0);

// Everything the dashboard home needs in one request.
exports.overview = catchAsync(async (req, res) => {
  const [projects, studio, infra, payments, customReminders, fin] = await Promise.all([
    ClientProject.all(),
    StudioProject.all(),
    Infrastructure.all(),
    Payment.all(),
    Reminder.model.find({ status: "pending" }).lean(),
    Settings.getFinance(),
  ]);

  const dev = payments.filter((p) => p.kind === "development");
  const monthKey = new Date().toISOString().slice(0, 7);
  const yearKey = monthKey.slice(0, 4);
  const inPeriod = (key) => dev.filter((p) => new Date(p.date).toISOString().startsWith(key));

  const paidByProject = {};
  dev.forEach((p) => {
    if (p.project_id) paidByProject[p.project_id] = (paidByProject[p.project_id] || 0) + p.amount;
  });

  // Past work (legacy) is a record only; it never counts towards money owed or pipeline.
  const live = projects.filter((p) => !["lost"].includes(p.status) && !p.legacy);
  const signedStages = ["signed", "deposit_paid", "in_progress", "delivered", "completed", "maintenance"];
  const outstanding = sumBy(
    live.filter((p) => signedStages.includes(p.status)),
    (p) => Math.max((p.quote || 0) - (paidByProject[p.id] || 0), 0)
  );

  const pipeline = {};
  ClientProject.STATUSES.forEach((s) => (pipeline[s] = 0));
  projects.filter((p) => !p.legacy).forEach((p) => (pipeline[p.status] += 1));

  // Monthly revenue for the last 12 months, oldest first.
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    months.push({ month: key, revenue: sumBy(inPeriod(key), (p) => p.amount) });
  }

  const upcoming = [
    ...projects
      .filter((p) => !p.legacy && !ClientProject.CLOSED.includes(p.status) && !["delivered", "maintenance"].includes(p.status) && within(p.deadline, 30))
      .map((p) => ({ kind: "client", id: p.id, title: p.name, subtitle: p.client.name, date: p.deadline, status: p.status })),
    ...projects
      .filter((p) => p.status === "maintenance" && !p.legacy && within(p.maintenance_deadline, 30))
      .map((p) => ({ kind: "maintenance", id: p.id, title: p.name, subtitle: `${p.client.name || "Client"} · maintenance`, date: p.maintenance_deadline, status: p.status })),
    ...studio
      .filter((p) => p.status !== "done" && within(p.deadline, 30))
      .map((p) => ({ kind: p.category, id: p.id, title: p.name, subtitle: `${p.category} project`, date: p.deadline, status: p.status })),
    ...infra
      .filter((i) => within(i.expires_at, 45))
      .map((i) => ({ kind: "renewal", id: i.id, title: i.name, subtitle: `${i.kind} · ${i.provider || "—"}`, date: i.expires_at })),
    ...customReminders
      .filter((r) => within(r.due_date, 30))
      .map((r) => ({ kind: "reminder", id: r._id.toString(), title: r.title, subtitle: r.body.slice(0, 45), date: r.due_date })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  res.status(200).json({
    status: "success",
    data: {
      split: fin.split,
      deposit_rate: fin.deposit_rate,
      bank_balance: fin.bank_balance,
      bank_balance_updated_at: fin.bank_balance_updated_at,
      totals: {
        revenue: sumBy(dev, (p) => p.amount),
        savings: sumBy(dev, (p) => p.allocation.savings),
        mastercard: sumBy(dev, (p) => p.allocation.mastercard),
        expenses: sumBy(dev, (p) => p.allocation.expenses),
        production_passthrough: sumBy(payments.filter((p) => p.kind === "production"), (p) => p.amount),
        revenue_this_month: sumBy(inPeriod(monthKey), (p) => p.amount),
        revenue_this_year: sumBy(inPeriod(yearKey), (p) => p.amount),
        outstanding,
        pipeline_value: sumBy(
          projects.filter((p) => !p.legacy && !["lost", "completed", ...signedStages].includes(p.status)),
          (p) => p.quote
        ),
      },
      counts: {
        active_clients: projects.filter((p) => !p.legacy && ["deposit_paid", "in_progress", "delivered", "signed"].includes(p.status)).length,
        maintenance: projects.filter((p) => p.status === "maintenance").length,
        open_leads: projects.filter((p) => !p.legacy && ["lead", "contacted", "discovery", "proposal_sent", "accepted", "contract_sent"].includes(p.status)).length,
        completed: projects.filter((p) => p.status === "completed" && !p.legacy).length,
        past_clients: projects.filter((p) => p.legacy).length,
        studio_active: studio.filter((p) => p.status === "in_progress").length,
        pending_reminders: customReminders.length,
      },
      pipeline,
      months,
      upcoming,
      recent_payments: payments.slice(0, 6),
    },
  });
});

exports.runReminders = catchAsync(async (req, res) => {
  const result = await reminders.run();
  res.status(200).json({ status: "success", ...result });
});

// For an external cron (cron-job.org, a Cloudflare Worker cron, etc.) so
// reminders still go out if the host sleeps between requests.
exports.cronReminders = catchAsync(async (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers["x-cron-secret"];

  if (!secret || !provided || typeof provided !== "string") {
    return next(new AppError("Not allowed.", 401));
  }

  const secretBuf = Buffer.from(secret);
  const providedBuf = Buffer.from(provided);

  if (secretBuf.length !== providedBuf.length || !crypto.timingSafeEqual(secretBuf, providedBuf)) {
    return next(new AppError("Not allowed.", 401));
  }

  const result = await reminders.run();
  res.status(200).json({ status: "success", ...result });
});
