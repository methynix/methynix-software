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

// The tightest threshold the item has crossed, or null if none yet. Keys carry
// the due date so moving a deadline re-arms its reminders.
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

// Finds everything that crossed a reminder threshold, emails one digest and
// marks those reminders as sent. Also processes custom user-created reminders.
exports.run = async () => {
  let customSent = 0;

  // 1. Process custom scheduled reminders
  try {
    const dueCustom = await Reminder.model.find({
      status: "pending",
      due_date: { $lte: new Date() },
    });

    for (const r of dueCustom) {
      try {
        await sendCustomReminder({
          to: r.recipient,
          title: r.title,
          body: r.body,
          sender: r.sender,
        });
        await Reminder.markSent(r._id);
        customSent++;
      } catch (err) {
        console.error(`[REMINDERS] Failed to send reminder "${r.title}":`, err.message);
      }
    }
  } catch (err) {
    console.error("[REMINDERS] Failed to check custom reminders:", err.message);
  }

  // 2. Process system deadline digests
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
      console.error("[REMINDERS] Failed to send reminder digest:", err.message);
    }
  }

  return { sent: items.length + customSent, customSent, digestSent: items.length };
};

// Dispatch a single custom reminder immediately
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

// In-process schedule. Checks every 15 minutes for prompt delivery of custom reminders.
exports.start = () => {
  const tick = () =>
    exports
      .run()
      .then((r) => r.sent && console.log(`[REMINDERS] Sent ${r.sent} reminder(s).`))
      .catch((err) => console.error("[REMINDERS] Failed:", err.message));
  setTimeout(tick, 30 * 1000);
  // Check every 15 minutes so scheduled custom reminders fire promptly around their scheduled time
  setInterval(tick, 15 * 60 * 1000);
};
