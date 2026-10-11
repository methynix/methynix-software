import { useCallback, useEffect, useMemo, useState } from "react";
import { infrastructureApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { PageHeader, Card, Stat, Button, Dialog, Field, Select, Pill, Empty, Loading, fmtDate, toInputDate, dueLabel, dueTone, daysUntil } from "./ui";

const KINDS = [
  { value: "domain", label: "Domain" },
  { value: "hosting", label: "Hosting" },
  { value: "vps", label: "VPS / server" },
  { value: "api", label: "API subscription" },
  { value: "subscription", label: "Other subscription" },
  { value: "other", label: "Other" },
];
const kindLabel = (v) => KINDS.find((k) => k.value === v)?.label || v;

const blank = () => ({ name: "", kind: "domain", provider: "", owner: "methynix", cost: "", currency: "USD", billing_cycle: "yearly", expires_at: "", auto_renew: false, url: "", notes: "" });

export const Infrastructure = () => {
  const { showToast } = useUI();
  const [items, setItems] = useState(null);
  const [kind, setKind] = useState("all");
  const [form, setForm] = useState(null);

  const load = useCallback(() => infrastructureApi.list().then(setItems).catch((e) => showToast(e.message, "error")), [showToast]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (items || []).filter((i) => kind === "all" || i.kind === kind), [items, kind]);

  const save = async () => {
    if (!form.name.trim()) return showToast("Add a name.", "error");
    const body = { ...form, cost: Number(form.cost) || 0, expires_at: form.expires_at || null };
    try {
      if (form.id) await infrastructureApi.update(form.id, body);
      else await infrastructureApi.create(body);
      setForm(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${form.name}?`)) return;
    await infrastructureApi.remove(form.id);
    setForm(null);
    load();
  };

  if (!items) return <Loading />;

  const soon = items.filter((i) => i.expires_at && daysUntil(i.expires_at) <= 30);
  const monthlyUSD = items
    .filter((i) => i.currency === "USD" && i.owner === "methynix")
    .reduce((s, i) => s + (i.billing_cycle === "monthly" ? i.cost : i.billing_cycle === "yearly" ? i.cost / 12 : 0), 0);

  return (
    <>
      <PageHeader
        title="Infrastructure & renewals"
        subtitle="Domains, hosting, VPSs and API subscriptions. You get emails 30, 7 and 1 day before anything expires."
        actions={<Button onClick={() => setForm(blank())}>Add item</Button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-4">
        <Stat label="Tracked items" value={items.length} />
        <Stat label="Expiring within 30 days" value={soon.length} tone={soon.length ? "sand" : "text"} />
        <Stat label="Domains" value={items.filter((i) => i.kind === "domain").length} />
        <Stat label="Methynix running cost (USD)" value={`$${monthlyUSD.toFixed(2)}/mo`} hint="Monthly + yearly ÷ 12, USD items only" />
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {[{ value: "all", label: "All" }, ...KINDS].map((k) => (
          <button key={k.value} onClick={() => setKind(k.value)} className={`px-3 py-1.5 rounded-lg text-xs border ${kind === k.value ? "border-accent/50 text-text bg-raised" : "border-line text-dim hover:text-text"}`}>
            {k.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty>Nothing tracked yet. Add your domains, hosting and subscriptions to get renewal reminders.</Empty>
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-xs text-faint border-b border-line">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Kind</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">For</th>
                  <th className="px-5 py-3 font-medium text-right">Cost</th>
                  <th className="px-5 py-3 font-medium">Expires / renews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((i) => (
                  <tr key={i.id} className="hover:bg-raised/30 cursor-pointer" onClick={() => setForm({ ...i, cost: String(i.cost || ""), expires_at: toInputDate(i.expires_at) })}>
                    <td className="px-5 py-3 font-medium">{i.name}</td>
                    <td className="px-5 py-3"><Pill>{kindLabel(i.kind)}</Pill></td>
                    <td className="px-5 py-3 text-dim">{i.provider || "—"}</td>
                    <td className="px-5 py-3 text-dim">{i.owner === "methynix" ? "Methynix" : i.owner}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{i.cost ? `${i.cost} ${i.currency}/${i.billing_cycle === "monthly" ? "mo" : i.billing_cycle === "yearly" ? "yr" : "once"}` : "—"}</td>
                    <td className={`px-5 py-3 ${dueTone(i.expires_at, 30)}`}>
                      {i.expires_at ? `${fmtDate(i.expires_at)} · ${dueLabel(i.expires_at)}` : "—"}
                      {i.auto_renew ? <span className="text-faint"> · auto</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit item" : "Add item"}
        footer={
          <>
            {form?.id ? <Button variant="danger" className="mr-auto" onClick={remove}>Delete</Button> : null}
            <Button variant="subtle" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        {form ? (
          <div className="space-y-3">
            <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="methynix.com" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Kind" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} options={KINDS} />
              <Field label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Cloudflare, Render, Anthropic…" />
              <Field label="Cost" inputMode="decimal" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              <Select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} options={[{ value: "USD", label: "USD" }, { value: "TZS", label: "TZS" }]} />
              <Select label="Billing" value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }, { value: "once", label: "One-off" }]} />
              <Field label="Expires / next renewal" type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              <Field label="For (owner)" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} hint="“methynix” or a client name" />
              <Field label="Dashboard link" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://" />
            </div>
            <label className="flex items-center gap-2 text-sm text-dim">
              <input type="checkbox" checked={form.auto_renew} onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })} />
              Auto-renews (you still get a reminder)
            </label>
            <Field label="Notes" type="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            {form.url ? <a href={form.url} target="_blank" rel="noreferrer" className="text-xs text-accent">Open dashboard ↗</a> : null}
          </div>
        ) : null}
      </Dialog>
    </>
  );
};
