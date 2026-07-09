import { Input } from "../../../components/ui/Input";
import { SignaturePad } from "../SignaturePad";
import { toNumber, formatTZS, amountInWords } from "../format";

const METHODS = [
  { key: "cash", label: "Cash" },
  { key: "mobile", label: "Mobile Money" },
  { key: "bank", label: "Bank Transfer" },
  { key: "other", label: "Other" },
];

export const ReceiptForm = ({ value, onChange }) => {
  const d = value.data;

  const patchData = (partial) => {
    const nextData = { ...d, ...partial };
    onChange({ ...value, data: nextData, total: toNumber(nextData.totalAmount) });
  };
  const patchClient = (partial) => onChange({ ...value, client: { ...value.client, ...partial } });

  // Recompute balance + words whenever amounts change.
  const setAmounts = (partial) => {
    const next = { ...d, ...partial };
    const total = toNumber(next.totalAmount);
    const paid = toNumber(next.amountPaid);
    next.balanceDue = String(Math.max(total - paid, 0));
    next.amountInWords = amountInWords(paid || total);
    onChange({ ...value, data: next, total });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Received from" value={value.client.name} onChange={(e) => patchClient({ name: e.target.value })} placeholder="Client name" />
        <Input label="Date" type="date" value={d.date} onChange={(e) => patchData({ date: e.target.value })} />
      </div>

      <Input label="Being payment for" type="textarea" value={d.paymentFor} onChange={(e) => patchData({ paymentFor: e.target.value })} placeholder="e.g. Annual web hosting" />

      <div>
        <span className="text-xs font-medium text-dim">Payment method</span>
        <div className="flex flex-wrap gap-3 mt-2">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => patchData({ method: m.key })}
              className={`px-3.5 py-2 rounded-lg text-sm border transition-colors ${
                d.method === m.key ? "bg-accent text-accentInk border-accent" : "border-line text-dim hover:text-text"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {d.method === "other" ? (
          <Input label="Specify other" value={d.methodOther} onChange={(e) => patchData({ methodOther: e.target.value })} placeholder="e.g. Cheque" />
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Total amount (TZS)" inputMode="numeric" value={d.totalAmount} onChange={(e) => setAmounts({ totalAmount: e.target.value })} placeholder="40000" />
        <Input label="Amount paid (TZS)" inputMode="numeric" value={d.amountPaid} onChange={(e) => setAmounts({ amountPaid: e.target.value })} placeholder="40000" />
        <Input label="Balance due (TZS)" inputMode="numeric" value={d.balanceDue} onChange={(e) => patchData({ balanceDue: e.target.value })} placeholder="0" />
      </div>

      <Input
        label="Sum in words"
        value={d.amountInWords}
        onChange={(e) => patchData({ amountInWords: e.target.value })}
        hint={`Auto-filled. Currently: ${formatTZS(toNumber(d.amountPaid) || toNumber(d.totalAmount))} TZS`}
      />

      <Input label="Received by (name)" value={d.receivedByName} onChange={(e) => patchData({ receivedByName: e.target.value })} />

      <SignaturePad label="Your signature" value={d.signature} onChange={(sig) => patchData({ signature: sig })} />
    </div>
  );
};
