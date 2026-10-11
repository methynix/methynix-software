import { motion, AnimatePresence } from "framer-motion";

// Shared building blocks for the admin dashboard pages.

export const money = (n) => `TZS ${Math.round(Number(n) || 0).toLocaleString("en-US")}`;

export const shortMoney = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1)}M`;
  if (Math.abs(v) >= 1e3) return `${Math.round(v / 1e3)}k`;
  return String(Math.round(v));
};

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export const daysUntil = (d) => (d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null);

export const dueLabel = (d) => {
  const n = daysUntil(d);
  if (n === null) return "";
  if (n < 0) return `${-n}d overdue`;
  if (n === 0) return "today";
  return `in ${n}d`;
};

// Red when overdue, sand within a week, dim otherwise.
export const dueTone = (d, warnDays = 7) => {
  const n = daysUntil(d);
  if (n === null) return "text-faint";
  if (n < 0) return "text-red-300";
  if (n <= warnDays) return "text-sand";
  return "text-dim";
};

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div className="min-w-0">
      <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="text-dim text-sm mt-1">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

export const Card = ({ title, actions, children, className = "", padded = true }) => (
  <section className={`rounded-2xl border border-line bg-surface ${className}`}>
    {title ? (
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h2 className="text-sm font-semibold">{title}</h2>
        {actions}
      </div>
    ) : null}
    <div className={padded ? "p-5" : ""}>{children}</div>
  </section>
);

export const Stat = ({ label, value, hint, tone = "text" }) => (
  <div className="rounded-2xl border border-line bg-surface p-4 md:p-5 min-w-0">
    <p className="text-xs text-dim">{label}</p>
    <p className={`font-display text-xl md:text-2xl font-semibold mt-1.5 tabular-nums truncate ${tone === "accent" ? "text-accent" : tone === "sand" ? "text-sand" : "text-text"}`}>
      {value}
    </p>
    {hint ? <p className="text-xs text-faint mt-1">{hint}</p> : null}
  </div>
);

export const Button = ({ variant = "primary", className = "", ...props }) => {
  const v = {
    primary: "bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text",
    ghost: "border border-line text-dim hover:text-text hover:border-accent/40",
    danger: "border border-red-500/30 text-red-300 hover:bg-red-500/10",
    subtle: "text-dim hover:text-text",
  }[variant];
  return <button type="button" {...props} className={`px-3.5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${v} ${className}`} />;
};

const fieldCls =
  "w-full bg-ink border border-line px-3 py-2.5 rounded-lg text-sm text-text placeholder:text-faint outline-none focus:border-accent transition-colors";

export const Field = ({ label, hint, className = "", ...props }) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    {label ? <span className="text-xs font-medium text-dim">{label}</span> : null}
    {props.type === "textarea" ? (
      <textarea rows={4} {...props} className={`${fieldCls} resize-y`} />
    ) : (
      <input {...props} className={fieldCls} />
    )}
    {hint ? <span className="text-xs text-faint">{hint}</span> : null}
  </label>
);

export const Select = ({ label, options, className = "", ...props }) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    {label ? <span className="text-xs font-medium text-dim">{label}</span> : null}
    <select {...props} className={fieldCls}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </label>
);

export const Empty = ({ children }) => (
  <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-dim">{children}</div>
);

export const Pill = ({ children, tone = "neutral" }) => {
  const t = {
    neutral: "bg-line/40 text-dim border-line",
    accent: "bg-accent/15 text-accent border-accent/30",
    sand: "bg-sand/10 text-sand border-sand/30",
    red: "bg-red-500/10 text-red-300 border-red-500/30",
    blue: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  }[tone];
  return <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${t}`}>{children}</span>;
};

// A wider dialog than components/ui/Modal, for forms.
export const Dialog = ({ open, onClose, title, children, footer, wide }) => (
  <AnimatePresence>
    {open ? (
      <div className="fixed inset-0 z-[150] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.16 }}
          role="dialog"
          aria-modal="true"
          className={`relative w-full ${wide ? "max-w-3xl" : "max-w-lg"} bg-surface border border-line rounded-2xl shadow-2xl my-8`}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            <button onClick={onClose} className="text-dim hover:text-text text-lg leading-none" aria-label="Close">✕</button>
          </div>
          <div className="px-6 pb-2 max-h-[70vh] overflow-y-auto">{children}</div>
          {footer ? <div className="px-6 py-4 flex justify-end gap-2 border-t border-line mt-4">{footer}</div> : null}
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>
);

export const Loading = () => <p className="text-dim text-sm">Loading…</p>;
