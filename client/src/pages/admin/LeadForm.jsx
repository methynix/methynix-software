import { Field, Select, Button } from "./ui";
import { PROJECT_TYPES, SOURCES } from "./constants";
import { BRAND_LIST } from "../../features/documents/brands";

export const emptyLead = () => ({
  name: "",
  type: "web",
  source: "",
  brand: "methynix",
  description: "",
  client: { name: "", company: "", email: "", phone: "", address: "" },
  quote: "",
  production_costs: [],
  start_date: "",
  deadline: "",
  notes: "",
});

// Shape a lead form for the API (numbers as numbers, empty dates as null).
export const leadPayload = (f) => ({
  ...f,
  quote: Number(String(f.quote || 0).replace(/[,\s]/g, "")) || 0,
  production_costs: (f.production_costs || [])
    .filter((c) => c.item)
    .map((c) => ({ ...c, amount: Number(String(c.amount || 0).replace(/[,\s]/g, "")) || 0 })),
  start_date: f.start_date || null,
  deadline: f.deadline || null,
});

export const LeadForm = ({ value, onChange }) => {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const setClient = (k) => (e) => onChange({ ...value, client: { ...value.client, [k]: e.target.value } });
  const costs = value.production_costs || [];
  const setCost = (i, k, v) => onChange({ ...value, production_costs: costs.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)) });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Project name" value={value.name} onChange={set("name")} placeholder="Examination Management Platform" className="sm:col-span-2" />
        <Select label="Type" value={value.type} onChange={set("type")} options={PROJECT_TYPES} />
        <Select label="Came from" value={value.source} onChange={set("source")} options={SOURCES} />
        <Select label="Documents go out as" value={value.brand} onChange={set("brand")} options={BRAND_LIST.map((b) => ({ value: b.key, label: b.legalName }))} className="sm:col-span-2" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-faint mb-2">Client</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Contact name" value={value.client.name} onChange={setClient("name")} placeholder="Fasali Mwenzegule" />
          <Field label="Company (optional)" value={value.client.company} onChange={setClient("company")} />
          <Field label="Email" type="email" value={value.client.email} onChange={setClient("email")} placeholder="client@email.com" hint="Needed to send the proposal and contract." />
          <Field label="Phone" value={value.client.phone} onChange={setClient("phone")} placeholder="+255 …" />
          <Field label="City / address" value={value.client.address} onChange={setClient("address")} placeholder="Dar-es-Salaam" className="sm:col-span-2" />
        </div>
      </div>

      <Field label="What they need" type="textarea" value={value.description} onChange={set("description")} placeholder="The system they want, in plain words. This becomes the proposal overview." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Development price (TZS)" inputMode="numeric" value={value.quote} onChange={set("quote")} placeholder="1400000" hint="Filled from the proposal later too." />
        <Field label="Start date" type="date" value={value.start_date} onChange={set("start_date")} />
        <Field label="Deadline" type="date" value={value.deadline} onChange={set("deadline")} hint="You get reminder emails 7, 3 and 1 day before." />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wide text-faint">Production costs the client pays (not revenue)</p>
          <button type="button" className="text-xs text-accent" onClick={() => onChange({ ...value, production_costs: [...costs, { item: "", amount: "", cycle: "yearly" }] })}>
            + Add
          </button>
        </div>
        {costs.length === 0 ? <p className="text-xs text-faint">e.g. domain, hosting, storage. These become the proposal's recurring costs.</p> : null}
        <div className="space-y-2">
          {costs.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_110px_100px_auto] gap-2">
              <Field value={c.item} onChange={(e) => setCost(i, "item", e.target.value)} placeholder="Domain registration" />
              <Field value={c.amount} inputMode="numeric" onChange={(e) => setCost(i, "amount", e.target.value)} placeholder="40000" />
              <Select value={c.cycle} onChange={(e) => setCost(i, "cycle", e.target.value)} options={[{ value: "yearly", label: "per year" }, { value: "monthly", label: "per month" }, { value: "once", label: "once" }]} />
              <Button variant="subtle" onClick={() => onChange({ ...value, production_costs: costs.filter((_, idx) => idx !== i) })} aria-label="Remove">✕</Button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Private notes" type="textarea" value={value.notes} onChange={set("notes")} />
    </div>
  );
};
