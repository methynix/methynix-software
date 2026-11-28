import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { overviewApi, paymentsApi, clientsApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { SkeletonFinance } from "../../components/ui/Skeleton";
import { PageHeader, Card, Stat, Button, Dialog, Field, Select, Pill, money, fmtDate, toInputDate } from "./ui";
import { RevenueChart } from "./Overview";

const blank = () => ({ project_id: "", kind: "development", stage: "", amount: "", date: toInputDate(new Date()), method: "Mobile money", reference: "", note: "", client_name: "" });

export const Finance = () => {
  const { showToast } = useUI();
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(null);

  const load = useCallback(() => {
    Promise.all([overviewApi.get(), paymentsApi.list(), clientsApi.list()])
      .then(([s, p, c]) => {
        setSummary(s);
        setPayments(p);
        setProjects(c);
      })
      .catch((e) => showToast(e.message, "error"));
  }, [showToast]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => payments.filter((p) => filter === "all" || p.kind === filter), [payments, filter]);

  const save = async () => {
    try {
      const saved = await paymentsApi.create({ ...form, project_id: form.project_id || null, amount: Number(String(form.amount).replace(/[,\s]/g, "")) });
      setForm(null);
      load();
      showToast(saved.note || "Payment recorded.");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete the ${money(p.amount)} payment?`)) return;
    await paymentsApi.remove(p.id);
    load();
  };

  if (!summary) return <SkeletonFinance />;
  const t = summary.totals;
  const pct = (k) => `${Math.round(summary.split[k] * 100)}%`;
  const billed = projects.filter((p) => !p.legacy && p.quote && !["lost", "lead", "contacted", "discovery"].includes(p.status));

  return (
    <>
      <PageHeader
        title="Finance"
        subtitle={`Every development payment is split ${pct("savings")} savings · ${pct("mastercard")} Mastercard · ${pct("expenses")} expenses. Production costs are pass-through and never counted.`}
        actions={<Button onClick={() => setForm(blank())}>Record payment</Button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
        <Stat label="Total revenue" value={money(t.revenue)} hint={`${money(t.revenue_this_month)} this month`} />
        <Stat label={`Savings · ${pct("savings")}`} value={money(t.savings)} tone="accent" />
        <Stat label={`Mastercard · ${pct("mastercard")}`} value={money(t.mastercard)} />
        <Stat label={`Expenses · ${pct("expenses")}`} value={money(t.expenses)} />
        <Stat label="Outstanding" value={money(t.outstanding)} tone="sand" hint="Signed, not yet paid" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <Card title="Revenue by month" className="xl:col-span-2">
          <RevenueChart months={summary.months} />
        </Card>
        <Card title="Pass-through (not revenue)">
          <p className="font-display text-2xl font-semibold tabular-nums">{money(t.production_passthrough)}</p>
          <p className="text-sm text-dim mt-2">
            Money clients paid for hosting, domains and other production costs that went straight to service providers.
          </p>
        </Card>
      </div>

      <Card title="Client balances" className="mt-4" padded={false}>
        {billed.length === 0 ? (
          <p className="p-5 text-sm text-dim">No priced client projects yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="text-left text-xs text-faint border-b border-line">
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-5 py-3 font-medium text-right">Deposit</th>
                  <th className="px-5 py-3 font-medium text-right">Paid</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {billed.map((p) => {
                  const dep = Math.round(p.quote * ((p.deposit_percent || 40) / 100));
                  return (
                    <tr key={p.id}>
                      <td className="px-5 py-3"><Link to={`/admin/dashboard/clients/${p.id}`} className="hover:text-accent">{p.name}</Link></td>
                      <td className="px-5 py-3 text-right tabular-nums">{money(p.quote)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums ${p.paid >= dep ? "text-dim" : "text-sand"}`}>{money(dep)} <span className="text-faint text-xs">({p.deposit_percent || 40}%)</span>{p.paid >= dep ? " ✓" : ""}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{money(p.paid)}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{money(Math.max(p.quote - p.paid, 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card
        title="All payments"
        className="mt-4"
        padded={false}
        actions={
          <div className="inline-flex rounded-lg border border-line p-0.5 bg-ink">
            {[["all", "All"], ["development", "Revenue"], ["production", "Pass-through"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`px-2.5 py-1 text-xs rounded-md ${filter === k ? "bg-raised text-text" : "text-dim"}`}>{l}</button>
            ))}
          </div>
        }
      >
        {shown.length === 0 ? (
          <p className="p-5 text-sm text-dim">No payments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-left text-xs text-faint border-b border-line">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">From</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium text-right">Savings</th>
                  <th className="px-5 py-3 font-medium text-right">Mastercard</th>
                  <th className="px-5 py-3 font-medium text-right">Expenses</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 text-dim whitespace-nowrap">{fmtDate(p.date)}</td>
                    <td className="px-5 py-3">
                      <p>{p.project_name || p.client_name || p.note || "—"}</p>
                      <p className="text-xs text-faint">
                        {p.kind === "production" ? <Pill>pass-through</Pill> : p.stage ? <Pill tone={p.stage === "deposit" ? "sand" : "neutral"}>{p.stage === "full" ? "full payment" : p.stage === "installment" ? "instalment" : p.stage}</Pill> : null} {p.method}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{money(p.amount)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-dim">{p.kind === "development" ? money(p.allocation.savings) : "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-dim">{p.kind === "development" ? money(p.allocation.mastercard) : "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-dim">{p.kind === "development" ? money(p.allocation.expenses) : "—"}</td>
                    <td className="px-5 py-3 text-right"><button onClick={() => remove(p)} className="text-xs text-red-300">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={Boolean(form)} onClose={() => setForm(null)} title="Record payment" footer={<><Button variant="subtle" onClick={() => setForm(null)}>Cancel</Button><Button onClick={save}>Record</Button></>}>
        {form ? (
          <div className="space-y-3">
            <Select
              label="Project"
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              options={[{ value: "", label: "Not tied to a project" }, ...projects.map((p) => ({ value: p.id, label: `${p.name} — ${p.client.name}` }))]}
            />
            {!form.project_id ? <Field label="From (client name)" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /> : null}
            <Select
              label="Kind"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              options={[{ value: "development", label: `Development (revenue, split ${pct("savings")} / ${pct("mastercard")} / ${pct("expenses")})` }, { value: "production", label: "Production costs (pass-through)" }]}
            />
            {form.kind === "development" && form.project_id ? (
              <Select
                label="Payment type"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                options={[
                  { value: "", label: "Automatic (first payment is the deposit)" },
                  { value: "deposit", label: "Deposit (upfront)" },
                  { value: "balance", label: "Remaining balance" },
                  { value: "full", label: "Full price, paid at once" },
                  { value: "installment", label: "Other instalment" },
                ]}
              />
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (TZS)" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <Field label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Field label="Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
              <Field label="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </div>
            <Field label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        ) : null}
      </Dialog>
    </>
  );
};
