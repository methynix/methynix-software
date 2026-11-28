import { useEffect, useState } from "react";
import { settingsApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { PageHeader, Card, Button, Field, money, fmtDate } from "./ui";

const SHARES = [
  { key: "savings", label: "Savings", hint: "Set aside for future plans" },
  { key: "mastercard", label: "Mastercard", hint: "Online bills and subscriptions" },
  { key: "expenses", label: "Expenses", hint: "Running costs" },
];

const num = (v) => Number(String(v ?? "").replace(/[,\s]/g, "")) || 0;

export const Settings = () => {
  const { showToast } = useUI();
  const [saved, setSaved] = useState(null);
  const [split, setSplit] = useState(null);
  const [deposit, setDeposit] = useState("");
  const [bank, setBank] = useState("");
  const [busy, setBusy] = useState("");

  const apply = (s) => {
    setSaved(s);
    setSplit({ savings: String(s.split_percent.savings), mastercard: String(s.split_percent.mastercard), expenses: String(s.split_percent.expenses) });
    setDeposit(String(s.deposit_percent));
    setBank(String(s.bank_balance || 0));
  };

  useEffect(() => {
    settingsApi.getFinance().then(apply).catch((e) => showToast(e.message, "error"));
  }, [showToast]);

  if (!saved || !split) return <p className="text-sm text-dim">Loading…</p>;

  const total = SHARES.reduce((s, x) => s + num(split[x.key]), 0);
  const ok = Math.abs(total - 100) < 0.001;

  const run = (name, body, message) => async () => {
    setBusy(name);
    try {
      apply(await settingsApi.setFinance(body));
      showToast(message);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="How money is split, and the balance you are keeping aside." />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Where each payment goes">
          <p className="text-sm text-dim mb-4">
            Every development payment is divided with these shares. Changes apply to payments recorded <strong className="text-text">from now on</strong>; payments already recorded keep the split they were saved with.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {SHARES.map((x) => (
              <Field key={x.key} label={`${x.label} %`} inputMode="decimal" value={split[x.key]} onChange={(e) => setSplit({ ...split, [x.key]: e.target.value })} hint={x.hint} />
            ))}
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-raised mt-4" aria-hidden="true">
            {SHARES.map((x, i) => (
              <div key={x.key} className={["bg-accent", "bg-sand", "bg-faint"][i]} style={{ width: `${Math.min(num(split[x.key]), 100)}%` }} />
            ))}
          </div>
          <p className={`text-xs mt-2 ${ok ? "text-dim" : "text-red-300"}`}>
            Total {Math.round(total * 100) / 100}% {ok ? "✓" : "· must add up to 100%"}
          </p>
          {num(split.savings) >= 0 && ok ? (
            <p className="text-xs text-faint mt-3">
              Example: a {money(1000000)} payment becomes {money(1000000 * num(split.savings) / 100)} savings · {money(1000000 * num(split.mastercard) / 100)} Mastercard · {money(1000000 * num(split.expenses) / 100)} expenses.
            </p>
          ) : null}
          <div className="mt-5">
            <Button
              disabled={!ok || busy === "split"}
              onClick={run("split", { split_percent: { savings: num(split.savings), mastercard: num(split.mastercard), expenses: num(split.expenses) } }, "Split saved. It applies to new payments.")}
            >
              {busy === "split" ? "Saving…" : "Save split"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Upfront deposit">
            <p className="text-sm text-dim mb-4">
              Share of the price a client pays before work starts. Each project keeps the percentage it was created with, so changing this affects <strong className="text-text">new projects only</strong>.
            </p>
            <div className="max-w-[200px]">
              <Field label="Deposit %" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
            </div>
            <div className="mt-4">
              <Button disabled={busy === "deposit"} onClick={run("deposit", { deposit_percent: num(deposit) }, "Deposit saved for new projects.")}>
                {busy === "deposit" ? "Saving…" : "Save deposit"}
              </Button>
            </div>
          </Card>

          <Card title="Bank balance set aside">
            <p className="text-sm text-dim mb-4">
              The net amount sitting in the bank that is not for spending, kept for your plans. It is entered by hand and shown on the Overview.
              {saved.bank_balance_updated_at ? ` Last updated ${fmtDate(saved.bank_balance_updated_at)}.` : ""}
            </p>
            <div className="max-w-xs">
              <Field label="Amount (TZS)" inputMode="numeric" value={bank} onChange={(e) => setBank(e.target.value)} hint={num(bank) ? money(num(bank)) : ""} />
            </div>
            <div className="mt-4">
              <Button disabled={busy === "bank"} onClick={run("bank", { bank_balance: num(bank) }, "Bank balance updated.")}>
                {busy === "bank" ? "Saving…" : "Update balance"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
