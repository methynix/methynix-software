import { Input } from "../../../components/ui/Input";
import { SignaturePad } from "../SignaturePad";
import { toNumber, formatTZS } from "../format";
import { defaultStages } from "../pdf/ContractPDF";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const ContractForm = ({ value, onChange }) => {
  const d = value.data;

  const patchData = (partial) => onChange({ ...value, data: { ...d, ...partial } });
  const patchClient = (partial) => onChange({ ...value, client: { ...value.client, ...partial } });

  const setTotal = (raw) => {
    const total = toNumber(raw);
    onChange({ ...value, total, data: { ...d, totalCost: raw, stages: defaultStages(total) } });
  };

  const setStageAmount = (i, raw) => {
    const stages = d.stages.map((s, idx) => (idx === i ? { ...s, amount: toNumber(raw) } : s));
    patchData({ stages });
  };

  const setDate = (iso) => {
    if (!iso) return;
    const dt = new Date(iso + "T00:00:00");
    patchData({ day: ordinal(dt.getDate()), month: MONTHS[dt.getMonth()], year: String(dt.getFullYear()) });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Client name / company" value={value.client.name} onChange={(e) => patchClient({ name: e.target.value })} placeholder="Neralda Enterprises Ltd" />
        <Input label="Client phone" value={value.client.phone} onChange={(e) => patchClient({ phone: e.target.value })} placeholder="+255 …" />
        <Input label="Client address" value={value.client.address} onChange={(e) => patchClient({ address: e.target.value })} placeholder="Arusha" />
        <Input label="Client email (optional)" value={value.client.email} onChange={(e) => patchClient({ email: e.target.value })} placeholder="client@email.com" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Agreement date" type="date" onChange={(e) => setDate(e.target.value)} hint={`Currently: ${d.day} ${d.month}, ${d.year}`} />
        <Input label="Operated by (provider)" value={d.providerOperator} onChange={(e) => patchData({ providerOperator: e.target.value })} />
      </div>

      <Input label="Project description" type="textarea" value={d.projectDescription} onChange={(e) => patchData({ projectDescription: e.target.value })} placeholder="What the project is and does…" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Total cost (TZS)" inputMode="numeric" value={d.totalCost} onChange={(e) => setTotal(e.target.value)} placeholder="2300000" />
        <Input label="Payment method" value={d.paymentMethod} onChange={(e) => patchData({ paymentMethod: e.target.value })} />
      </div>

      <div>
        <span className="text-xs font-medium text-dim">Payment stages (amounts auto-split from total, editable)</span>
        <div className="space-y-2 mt-2">
          {d.stages.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="w-16 text-dim shrink-0">{s.stage}</span>
              <span className="flex-1 text-dim truncate">{s.description} ({s.percent}%)</span>
              <input
                value={s.amount}
                onChange={(e) => setStageAmount(i, e.target.value)}
                inputMode="numeric"
                className="w-32 bg-ink border border-line p-2 rounded-lg text-text text-right outline-none focus:border-accent tabular-nums"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-2 text-sm">
          <span className="text-dim mr-3">Grand total</span>
          <span className="font-semibold tabular-nums">TZS {formatTZS(value.total)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Your name (signatory)" value={d.providerSignName} onChange={(e) => patchData({ providerSignName: e.target.value })} />
        <Input label="Your title" value={d.providerSignTitle} onChange={(e) => patchData({ providerSignTitle: e.target.value })} />
      </div>

      <SignaturePad label="Your signature (provider)" value={d.providerSignature} onChange={(sig) => patchData({ providerSignature: sig })} />
      <p className="text-xs text-faint">The client signs their part offline after you send the PDF.</p>
    </div>
  );
};
