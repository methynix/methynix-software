import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { overviewApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { PageHeader, Card, Stat, Button, Empty, Pill, Loading, money, shortMoney, fmtDate, dueLabel, dueTone } from "./ui";
import { STAGES } from "./constants";

const MONTH = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short" });

// Single-series column chart of development revenue per month.
export const RevenueChart = ({ months }) => {
  const [hover, setHover] = useState(null);
  const max = Math.max(...months.map((m) => m.revenue), 1);
  const total = months.reduce((s, m) => s + m.revenue, 0);

  if (!total) return <Empty>No development payments recorded in the last 12 months.</Empty>;

  return (
    <div>
      <div className="relative h-48 flex items-end gap-[2px] border-b border-line" onMouseLeave={() => setHover(null)}>
        {months.map((m, i) => (
          <div
            key={m.month}
            className="flex-1 h-full flex items-end cursor-default"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            tabIndex={0}
            aria-label={`${MONTH(m.month)} ${m.month.slice(0, 4)}: ${money(m.revenue)}`}
          >
            <div
              className={`w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-accent" : "bg-accent/70"}`}
              style={{ height: `${(m.revenue / max) * 100}%`, minHeight: m.revenue ? 2 : 0 }}
            />
          </div>
        ))}
        {hover !== null ? (
          <div
            className="absolute top-0 z-10 px-2.5 py-1.5 rounded-lg bg-raised border border-line text-xs whitespace-nowrap pointer-events-none"
            style={{ left: `${((hover + 0.5) / months.length) * 100}%`, transform: "translate(-50%, -100%)" }}
          >
            <p className="text-dim">{MONTH(months[hover].month)} {months[hover].month.slice(0, 4)}</p>
            <p className="font-medium tabular-nums">{money(months[hover].revenue)}</p>
          </div>
        ) : null}
      </div>
      <div className="flex gap-[2px] mt-2">
        {months.map((m, i) => (
          <span key={m.month} className="flex-1 text-center text-[10px] text-faint">
            {i % 2 === 0 || months.length <= 6 ? MONTH(m.month) : ""}
          </span>
        ))}
      </div>
      <p className="text-xs text-faint mt-3">Peak month {shortMoney(max)} · 12-month total {money(total)}</p>
    </div>
  );
};

const KIND_LABEL = { client: "Client", mother: "Mother", hobby: "Hobby", renewal: "Renewal" };
const KIND_LINK = { client: (i) => `/admin/dashboard/clients/${i.id}`, mother: () => "/admin/dashboard/projects", hobby: () => "/admin/dashboard/projects", renewal: () => "/admin/dashboard/infrastructure" };

export const Overview = () => {
  const { showToast } = useUI();
  const [data, setData] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    overviewApi.get().then(setData).catch((e) => showToast(e.message, "error"));
  }, [showToast]);

  const sendReminders = async () => {
    setSending(true);
    try {
      const r = await overviewApi.runReminders();
      showToast(r.sent ? `Emailed you ${r.sent} reminder${r.sent === 1 ? "" : "s"}.` : "Nothing new to remind you about.");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSending(false);
    }
  };

  if (!data) return <Loading />;
  const t = data.totals;
  const pct = (k) => `${Math.round(data.split[k] * 100)}%`;
  const funnel = STAGES.filter((s) => !["on_hold", "lost"].includes(s.key));
  const maxStage = Math.max(...funnel.map((s) => data.pipeline[s.key] || 0), 1);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        actions={
          <>
            <Button variant="ghost" onClick={sendReminders} disabled={sending}>{sending ? "Checking…" : "Send reminders now"}</Button>
            <Link to="/admin/dashboard/clients?new=1" className="px-3.5 py-2 rounded-lg text-sm bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text transition-colors">
              New lead
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Total revenue (development)" value={money(t.revenue)} hint={`${money(t.revenue_this_year)} this year`} />
        <Stat label={`Savings · ${pct("savings")}`} value={money(t.savings)} tone="accent" hint="For future dreams" />
        <Stat label={`Mastercard · ${pct("mastercard")}`} value={money(t.mastercard)} hint="Online bills & subscriptions" />
        <Stat label={`Expenses · ${pct("expenses")}`} value={money(t.expenses)} hint="Running costs" />
        <Stat label="Revenue this month" value={money(t.revenue_this_month)} />
        <Stat label="Outstanding from clients" value={money(t.outstanding)} tone="sand" hint="Signed work not yet paid" />
        <Stat label="Open leads" value={data.counts.open_leads} hint={t.pipeline_value ? `${money(t.pipeline_value)} quoted` : "Before signing"} />
        <Stat label="Active client projects" value={data.counts.active_clients} hint={`${data.counts.completed} completed all-time`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <Card title="Development revenue, last 12 months" className="xl:col-span-2">
          <RevenueChart months={data.months} />
        </Card>

        <Card title="Coming up (30 days)" actions={<span className="text-xs text-faint">Deadlines & renewals</span>} padded={false}>
          {data.upcoming.length === 0 ? (
            <p className="p-5 text-sm text-dim">Nothing due in the next 30 days.</p>
          ) : (
            <ul className="divide-y divide-line max-h-80 overflow-y-auto">
              {data.upcoming.map((u) => (
                <li key={`${u.kind}-${u.id}`}>
                  <Link to={KIND_LINK[u.kind](u)} className="flex items-center gap-3 px-5 py-3 hover:bg-raised/40">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.title}</p>
                      <p className="text-xs text-faint truncate">{KIND_LABEL[u.kind]} · {u.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-medium ${dueTone(u.date)}`}>{dueLabel(u.date)}</p>
                      <p className="text-[11px] text-faint">{fmtDate(u.date)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <Card title="Pipeline" actions={<Link to="/admin/dashboard/clients" className="text-xs text-accent">Open board →</Link>}>
          <ul className="space-y-2">
            {funnel.map((s) => {
              const n = data.pipeline[s.key] || 0;
              return (
                <li key={s.key} className="grid grid-cols-[110px_1fr_28px] items-center gap-3 text-sm">
                  <span className="text-dim truncate">{s.label}</span>
                  <div className="h-2.5 rounded-full bg-raised overflow-hidden">
                    <div className="h-full rounded-full bg-accent/70" style={{ width: `${(n / maxStage) * 100}%` }} />
                  </div>
                  <span className="text-right tabular-nums text-text">{n}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Recent payments" actions={<Link to="/admin/dashboard/finance" className="text-xs text-accent">Finance →</Link>} padded={false}>
          {data.recent_payments.length === 0 ? (
            <p className="p-5 text-sm text-dim">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recent_payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.project_name || p.note || "Payment"}</p>
                    <p className="text-xs text-faint truncate">{p.client_name || "—"} · {fmtDate(p.date)}</p>
                  </div>
                  {p.kind === "production" ? <Pill>pass-through</Pill> : p.is_deposit ? <Pill tone="sand">deposit</Pill> : null}
                  <span className="text-sm tabular-nums">{money(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

    </>
  );
};
