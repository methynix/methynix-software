const ClientProject = require("../models/clientProjectModel");
const StudioProject = require("../models/studioProjectModel");
const Infrastructure = require("../models/infrastructureModel");
const Reminder = require("../models/reminderModel");
const { sendReminderDigest, sendCustomReminder } = require("./mailService");

const DAY = 24 * 60 * 60 * 1000;

// Days-before-due at which a reminder goes out. 0 means "due today or overdue".
const RULES = {
  client: [7, 3, 1, 0],
  studio: [7, 1, 0],
  infrastructure: [30, 7, 1, 0],
};

const daysLeft = (date) => Math.ceil((new Date(date).getTime() - Date.now()) / DAY);

const dueKey = (date, thresholds) => {
  const left = daysLeft(date);
  const hit = [...thresholds].sort((a, b) => a - b).find((t) => left <= t);
  if (hit === undefined) return null;
  return { key: `${hit}:${new Date(date).toISOString().slice(0, 10)}`, left };
};

const whenText = (left) =>
  left < 0 ? `${-left} day${left === -1 ? "" : "s"} overdue` : left === 0 ? "Today" : `In ${left} day${left === 1 ? "" : "s"}`;

const collect = async (Model, query, dateField, thresholds, describe) => {
  const docs = await Model.find(query).lean();
  const due = [];
  docs.forEach((d) => {
    if (!d[dateField]) return;
    const hit = dueKey(d[dateField], thresholds);
    if (!hit || (d.reminders_sent || []).includes(hit.key)) return;
    due.push({ id: d._id, key: hit.key, item: { ...describe(d), when: whenText(hit.left), overdue: hit.left < 0 } });
  });
  return due;
};

// Automatically checks for any custom scheduled reminders that have reached their date/time
const processCustomReminders = async () => {
  let count = 0;
  try {
    const due = await Reminder.model.find({
      status: "pending",
      due_date: { $lte: new Date() },
    });

    for (const r of due) {
      try {
        console.log(`[AUTOMATIC_REMINDER] Due date reached for "${r.title}". Automatically dispatching email to ${r.recipient}...`);
        await sendCustomReminder({
          to: r.recipient,
          title: r.title,
          body: r.body,
          sender: r.sender,
        });
        await Reminder.markSent(r._id);
        count++;
        console.log(`[AUTOMATIC_REMINDER] Successfully delivered email reminder: "${r.title}" to ${r.recipient}`);
      } catch (err) {
        console.error(`[AUTOMATIC_REMINDER] Delivery failed for "${r.title}":`, err.message);
      }
    }
  } catch (err) {
    console.error("[AUTOMATIC_REMINDER] Error checking pending reminders:", err.message);
  }
  return count;
};

// System deadline digests for projects and infrastructure
const processDigests = async () => {
  const groups = [
    {
      Model: ClientProject.model,
      due: await collect(
        ClientProject.model,
        { status: { $nin: ClientProject.CLOSED }, deadline: { $ne: null } },
        "deadline",
        RULES.client,
        (d) => ({ group: "Client project", title: d.name, detail: `${d.client?.name || ""} · ${d.status.replace(/_/g, " ")}` })
      ),
    },
    {
      Model: StudioProject.model,
      due: await collect(
        StudioProject.model,
        { status: { $ne: "done" }, deadline: { $ne: null } },
        "deadline",
        RULES.studio,
        (d) => ({ group: d.category === "hobby" ? "Hobby project" : "Mother project", title: d.name, detail: d.status.replace(/_/g, " ") })
      ),
    },
    {
      Model: Infrastructure.model,
      due: await collect(
        Infrastructure.model,
        { expires_at: { $ne: null } },
        "expires_at",
        RULES.infrastructure,
        (d) => ({
          group: `Renewal · ${d.kind}`,
          title: d.name,
          detail: [d.provider, d.auto_renew ? "auto-renews" : "manual renewal", d.cost ? `${d.cost} ${d.currency}` : ""]
            .filter(Boolean)
            .join(" · "),
        })
      ),
    },
  ];

  const items = groups.flatMap((g) => g.due.map((d) => d.item));
  if (items.length > 0) {
    try {
      await sendReminderDigest(items);
      await Promise.all(
        groups.flatMap((g) => g.due.map((d) => g.Model.updateOne({ _id: d.id }, { $addToSet: { reminders_sent: d.key } })))
      );
    } catch (err) {
      console.error("[REMINDERS] Failed to send digest:", err.message);
    }
  }
  return items.length;
};

// Combined run function called by external cron or manual triggers
exports.run = async () => {
  const customSent = await processCustomReminders();
  const digestSent = await processDigests();
  return { sent: customSent + digestSent, customSent, digestSent };
};

exports.processCustomReminders = processCustomReminders;

// Dispatch a single reminder immediately if requested
exports.sendSingleNow = async (id) => {
  const r = await Reminder.findById(id);
  if (!r) throw new Error("Reminder not found.");

  await sendCustomReminder({
    to: r.recipient,
    title: r.title,
    body: r.body,
    sender: r.sender,
  });

  return Reminder.markSent(r.id);
};

// Automated scheduler:
// 1. Checks every 60 seconds so custom scheduled reminders fire automatically on time.
// 2. Checks every 6 hours for project deadline digests.
exports.start = () => {
  console.log("[AUTOMATIC_REMINDER] Automated scheduler started. Checking for due reminders every 60s.");

  // Check immediately on startup
  setTimeout(() => {
    processCustomReminders();
    processDigests();
  }, 5000);

  // Check every 60 seconds for scheduled reminders that have arrived at their due date/time
  setInterval(() => {
    processCustomReminders();
  }, 60 * 1000);

  // Check project deadlines every 6 hours
  setInterval(() => {
    processDigests();
  }, 6 * 60 * 60 * 1000);
};
