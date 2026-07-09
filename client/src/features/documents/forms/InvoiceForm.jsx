import { Input } from "../../../components/ui/Input";
import { formatTZS, toNumber } from "../format";

const computeTotal = (items) =>
  items.reduce((s, it) => s + toNumber(it.quantity) * toNumber(it.unitPrice), 0);

export const InvoiceForm = ({ value, onChange }) => {
  const d = value.data;

  const patchData = (partial) => {
    const nextData = { ...d, ...partial };
    onChange({ ...value, data: nextData, total: computeTotal(nextData.items) });
  };
  const patchClient = (partial) => onChange({ ...value, client: { ...value.client, ...partial } });

  const setItem = (i, key, val) => {
    const items = d.items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    patchData({ items });
  };
  const addRow = () => patchData({ items: [...d.items, { service: "", quantity: "", unitPrice: "" }] });
  const removeRow = (i) => patchData({ items: d.items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Client name" value={value.client.name} onChange={(e) => patchClient({ name: e.target.value })} placeholder="ALDO" />
        <Input label="Client email" value={value.client.email} onChange={(e) => patchClient({ email: e.target.value })} placeholder="client@email.com" />
        <Input label="Client phone" value={value.client.phone} onChange={(e) => patchClient({ phone: e.target.value })} placeholder="+255 …" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Invoice date" type="date" value={d.date} onChange={(e) => patchData({ date: e.target.value })} />
        <Input label="Due date" type="date" value={d.dueDate} onChange={(e) => patchData({ dueDate: e.target.value })} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-dim">Line items</span>
          <button type="button" onClick={addRow} className="text-xs text-accent hover:text-accentDeep">+ Add row</button>
        </div>
        <div className="space-y-2">
          {d.items.map((it, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={it.service}
                onChange={(e) => setItem(i, "service", e.target.value)}
                placeholder="Service"
                className="flex-[3] bg-ink border border-line p-2.5 rounded-lg text-text placeholder:text-faint outline-none focus:border-accent text-sm"
              />
              <input
                value={it.quantity}
                onChange={(e) => setItem(i, "quantity", e.target.value)}
                placeholder="Qty"
                inputMode="numeric"
                className="flex-1 w-16 bg-ink border border-line p-2.5 rounded-lg text-text placeholder:text-faint outline-none focus:border-accent text-sm"
              />
              <input
                value={it.unitPrice}
                onChange={(e) => setItem(i, "unitPrice", e.target.value)}
                placeholder="Unit price"
                inputMode="numeric"
                className="flex-[2] bg-ink border border-line p-2.5 rounded-lg text-text placeholder:text-faint outline-none focus:border-accent text-sm"
              />
              <span className="flex-[2] text-right text-sm text-dim tabular-nums">
                {toNumber(it.quantity) * toNumber(it.unitPrice) ? formatTZS(toNumber(it.quantity) * toNumber(it.unitPrice)) : "—"}
              </span>
              <button type="button" onClick={() => removeRow(i)} className="text-red-300 hover:text-red-200 text-lg leading-none px-1">×</button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-3 text-sm">
          <span className="text-dim mr-3">Total</span>
          <span className="font-semibold tabular-nums">TZS {formatTZS(value.total)}/=</span>
        </div>
      </div>

      <Input label="Mobile Money (payment details)" value={d.paymentMobile} onChange={(e) => patchData({ paymentMobile: e.target.value })} />
      <Input label="Notes (optional)" type="textarea" value={d.notes} onChange={(e) => patchData({ notes: e.target.value })} placeholder="Any extra note shown on the invoice." />
    </div>
  );
};
