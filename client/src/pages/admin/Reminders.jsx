import { useCallback, useEffect, useMemo, useState } from "react";
import { remindersApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { PageHeader, Card, Stat, Button, Dialog, Field, Pill, Empty, fmtDate, dueLabel, dueTone, daysUntil } from "./ui";

const toInputDateTime = (d) => {
  if (!d) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  }
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  const yr = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const da = pad(date.getDate());
  const hr = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yr}-${mo}-${da}T${hr}:${mi}`;
};

const blankReminder = () => ({
  title: "",
  body: "",
  due_date: toInputDateTime(),
  recipient: "methodhelen@gmail.com",
  sender: "info@methynix.com",
});

export const Reminders = () => {
  const { showToast } = useUI();
  const [reminders, setReminders] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(() => {
    remindersApi
      .list()
      .then(setReminders)
      .catch((e) => showToast(e.message, "error"));
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!form.title.trim()) return showToast("Add a title for your reminder.", "error");
    if (!form.body.trim()) return showToast("Add the reminder message body.", "error");
    if (!form.due_date) return showToast("Choose a date for the reminder.", "error");

    setBusy("save");
    try {
      if (form.id) {
        await remindersApi.update(form.id, form);
        showToast("Reminder updated.");
      } else {
        await remindersApi.create(form);
        const formattedDate = new Date(form.due_date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        showToast(`Scheduled! Email will automatically send on ${formattedDate}.`);
      }
      setForm(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete reminder "${r.title}"?`)) return;
    try {
      await remindersApi.remove(r.id);
      showToast("Reminder deleted.");
      if (form?.id === r.id) setForm(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const sendTestNow = async (r) => {
    if (!window.confirm(`Send an early test copy of "${r.title}" to ${r.recipient} right now?`)) return;
    setBusy(`send-${r.id}`);
    try {
      const res = await remindersApi.sendNow(r.id);
      showToast(res.message || `Test reminder email sent to ${r.recipient}.`);
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (reminders || []).filter((r) => {
      const matchesFilter = filter === "all" || r.status === filter;
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.recipient.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [reminders, filter, query]);

  if (!reminders) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface rounded-lg w-1/4" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const pending = reminders.filter((r) => r.status === "pending");
  const sent = reminders.filter((r) => r.status === "sent");
  const dueSoon = pending.filter((r) => daysUntil(r.due_date) <= 7);

  return (
    <>
      <PageHeader
        title="Reminders"
        subtitle="Automatic email scheduler: set the date and message, and an email will automatically be sent to methodhelen@gmail.com on that date."
        actions={
          <Button onClick={() => setForm(blankReminder())}>
            Schedule a reminder
          </Button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-5">
        <Stat label="Total reminders" value={reminders.length} />
        <Stat
          label="Auto-scheduled (Pending)"
          value={pending.length}
          tone={pending.length ? "sand" : "text"}
          hint="Will send automatically on set date"
        />
        <Stat label="Due in next 7 days" value={dueSoon.length} tone={dueSoon.length ? "accent" : "text"} />
        <Stat label="Delivered" value={sent.length} hint="Delivered to your inbox" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search scheduled reminders…"
          className="flex-1 min-w-[200px] max-w-sm bg-surface border border-line px-3 py-2 rounded-lg text-sm outline-none focus:border-accent"
        />
        <div className="inline-flex rounded-lg border border-line p-0.5 bg-surface">
          {[
            { id: "all", label: `All (${reminders.length})` },
            { id: "pending", label: `Auto-scheduled (${pending.length})` },
            { id: "sent", label: `Delivered (${sent.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${
                filter === t.id ? "bg-raised text-text font-medium" : "text-dim hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty>
          {query
            ? "No reminders match your search."
            : filter === "pending"
            ? "No pending reminders. Click 'Schedule a reminder' to set one."
            : filter === "sent"
            ? "No reminders sent yet."
            : "No reminders set yet. Click 'Schedule a reminder' above to set the date and message."}
        </Empty>
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-xs text-faint border-b border-line">
                  <th className="px-5 py-3 font-medium">Subject & Message</th>
                  <th className="px-5 py-3 font-medium">To / From</th>
                  <th className="px-5 py-3 font-medium">Scheduled Date</th>
                  <th className="px-5 py-3 font-medium">Automatic Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((r) => {
                  const isPending = r.status === "pending";
                  const isSending = busy === `send-${r.id}`;
                  return (
                    <tr key={r.id} className="hover:bg-raised/30 transition-colors">
                      <td className="px-5 py-3.5 max-w-md">
                        <p className="font-medium text-text">{r.title}</p>
                        <p className="text-xs text-dim mt-1 whitespace-pre-wrap line-clamp-2">{r.body}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs font-mono text-text">{r.recipient}</p>
                        <p className="text-[11px] text-faint">from: {r.sender || "info@methynix.com"}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className={`text-xs font-medium ${isPending ? dueTone(r.due_date) : "text-dim"}`}>
                          {fmtDate(r.due_date)} at {new Date(r.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-[11px] text-faint">
                          {isPending ? dueLabel(r.due_date) : r.sent_at ? `Sent ${fmtDate(r.sent_at)}` : "Delivered"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isPending ? (
                          <div>
                            <Pill tone="sand">Auto-scheduled</Pill>
                            <p className="text-[10px] text-sand mt-0.5">Sends automatically</p>
                          </div>
                        ) : (
                          <div>
                            <Pill tone="accent">Delivered</Pill>
                            <p className="text-[10px] text-faint mt-0.5">Sent to inbox</p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...r,
                                due_date: toInputDateTime(r.due_date),
                              })
                            }
                            className="px-2.5 py-1 text-xs rounded-md border border-line text-dim hover:text-text hover:bg-raised transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(r)}
                            className="px-2.5 py-1 text-xs rounded-md border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            Delete
                          </button>
                          {isPending ? (
                            <button
                              type="button"
                              disabled={isSending}
                              onClick={() => sendTestNow(r)}
                              className="text-[11px] text-faint hover:text-accent transition-colors underline ml-1"
                              title="Send an immediate test email right now before the scheduled date"
                            >
                              {isSending ? "Sending…" : "Test send"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reminder Editor Dialog */}
      <Dialog
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit scheduled reminder" : "Schedule an automatic reminder"}
        footer={
          <>
            {form?.id ? (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() => remove(form)}
                disabled={busy === "save"}
              >
                Delete
              </Button>
            ) : null}
            <Button variant="subtle" onClick={() => setForm(null)} disabled={busy === "save"}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy === "save"}>
              {busy === "save" ? "Saving…" : form?.id ? "Update reminder" : "Save and schedule"}
            </Button>
          </>
        }
      >
        {form ? (
          <div className="space-y-4">
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs text-text leading-relaxed">
              💡 <strong>Completely Automatic:</strong> Once you set the date below, our server automatically sends the email to <strong>{form.recipient || "methodhelen@gmail.com"}</strong> on that exact date. You don't have to do anything manually!
            </div>

            <Field
              label="Subject / Title of the email"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Follow up on hospital website project"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Date & time for email to arrive"
                type="datetime-local"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                hint="When the email should automatically arrive in your inbox"
              />
              <Field
                label="Recipient (Where to receive it)"
                type="email"
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                placeholder="methodhelen@gmail.com"
                hint="Your email (defaults to methodhelen@gmail.com)"
              />
            </div>

            <Field
              label="Sender"
              value={form.sender || "info@methynix.com"}
              disabled
              hint="Sent from your official email (info@methynix.com)"
            />

            <Field
              label="Email Body / Message"
              type="textarea"
              rows={6}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write the full reminder message that will be in the email body."
            />
          </div>
        ) : null}
      </Dialog>
    </>
  );
};
