// Small editors shared by the document forms.

const inputCls =
  "w-full bg-ink border border-line px-2.5 py-2 rounded-lg text-sm text-text placeholder:text-faint outline-none focus:border-accent transition-colors";

export const FormSection = ({ title, hint, children, actions }) => (
  <section className="space-y-3 pt-5 border-t border-line first:border-t-0 first:pt-0">
    <div className="flex items-end justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {hint ? <p className="text-xs text-faint mt-0.5">{hint}</p> : null}
      </div>
      {actions}
    </div>
    {children}
  </section>
);

const IconButton = ({ label, onClick, children, danger }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className={`h-8 w-8 shrink-0 rounded-md border border-line text-xs grid place-items-center transition-colors ${
      danger ? "text-red-300 hover:border-red-400/50" : "text-dim hover:text-text hover:border-accent/50"
    }`}
  >
    {children}
  </button>
);

const move = (arr, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

const AddButton = ({ onClick, children = "Add row" }) => (
  <button type="button" onClick={onClick} className="text-xs text-accent hover:text-accentDeep">
    + {children}
  </button>
);

// A list of plain strings (features, terms, bullet points).
export const ListEditor = ({ items = [], onChange, placeholder, multiline }) => {
  const set = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-xs text-faint w-5 pt-2.5 text-right tabular-nums">{i + 1}.</span>
          {multiline ? (
            <textarea value={item} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} rows={2} className={`${inputCls} resize-y`} />
          ) : (
            <input value={item} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} className={inputCls} />
          )}
          <IconButton label="Move up" onClick={() => onChange(move(items, i, -1))}>↑</IconButton>
          <IconButton label="Remove" danger onClick={() => onChange(items.filter((_, idx) => idx !== i))}>✕</IconButton>
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, ""])}>Add item</AddButton>
    </div>
  );
};

// Rows of objects. fields: [{ key, label, width ("1fr", "120px"), placeholder, numeric, multiline }]
export const RowsEditor = ({ rows = [], fields, onChange, blank }) => {
  const set = (i, key, v) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  const grid = { gridTemplateColumns: `${fields.map((f) => f.width || "1fr").join(" ")} auto` };
  return (
    <div className="space-y-2 overflow-x-auto">
      <div className="grid gap-2 min-w-[520px]" style={grid}>
        {fields.map((f) => (
          <span key={f.key} className="text-[11px] uppercase tracking-wide text-faint">{f.label}</span>
        ))}
        <span />
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 items-start min-w-[520px]" style={grid}>
          {fields.map((f) =>
            f.multiline ? (
              <textarea key={f.key} value={r[f.key] ?? ""} rows={2} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className={`${inputCls} resize-y`} />
            ) : (
              <input
                key={f.key}
                value={r[f.key] ?? ""}
                placeholder={f.placeholder}
                inputMode={f.numeric ? "numeric" : undefined}
                onChange={(e) => set(i, f.key, e.target.value)}
                className={`${inputCls} ${f.numeric ? "text-right tabular-nums" : ""}`}
              />
            )
          )}
          <div className="flex gap-1">
            <IconButton label="Move up" onClick={() => onChange(move(rows, i, -1))}>↑</IconButton>
            <IconButton label="Remove row" danger onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>✕</IconButton>
          </div>
        </div>
      ))}
      <AddButton onClick={() => onChange([...rows, { ...blank }])} />
    </div>
  );
};

// A free-form table: editable column headers and cells.
export const TableEditor = ({ columns = [], rows = [], onChange }) => {
  const setCol = (ci, v) => onChange({ columns: columns.map((c, i) => (i === ci ? v : c)), rows });
  const setCell = (ri, ci, v) =>
    onChange({ columns, rows: rows.map((r, i) => (i === ri ? columns.map((_, k) => (k === ci ? v : r[k] ?? "")) : r)) });
  const addCol = () => onChange({ columns: [...columns, "Column"], rows: rows.map((r) => [...r, ""]) });
  const removeCol = (ci) => onChange({ columns: columns.filter((_, i) => i !== ci), rows: rows.map((r) => r.filter((_, i) => i !== ci)) });
  const grid = { gridTemplateColumns: `repeat(${columns.length}, minmax(120px, 1fr)) auto` };

  return (
    <div className="space-y-2 overflow-x-auto">
      <div className="grid gap-2" style={grid}>
        {columns.map((c, ci) => (
          <div key={ci} className="flex gap-1">
            <input value={c} onChange={(e) => setCol(ci, e.target.value)} className={`${inputCls} font-semibold bg-raised`} />
            {columns.length > 1 ? <IconButton label="Remove column" danger onClick={() => removeCol(ci)}>✕</IconButton> : null}
          </div>
        ))}
        <IconButton label="Add column" onClick={addCol}>+</IconButton>
      </div>
      {rows.map((r, ri) => (
        <div key={ri} className="grid gap-2 items-start" style={grid}>
          {columns.map((_, ci) => (
            <textarea key={ci} value={r[ci] ?? ""} rows={1} onChange={(e) => setCell(ri, ci, e.target.value)} className={`${inputCls} resize-y min-h-[38px]`} />
          ))}
          <div className="flex gap-1">
            <IconButton label="Move up" onClick={() => onChange({ columns, rows: move(rows, ri, -1) })}>↑</IconButton>
            <IconButton label="Remove row" danger onClick={() => onChange({ columns, rows: rows.filter((_, i) => i !== ri) })}>✕</IconButton>
          </div>
        </div>
      ))}
      <AddButton onClick={() => onChange({ columns, rows: [...rows, columns.map(() => "")] })} />
    </div>
  );
};

export const TextField = ({ label, value, onChange, placeholder, type = "text", hint, multiline, rows = 4 }) => (
  <label className="flex flex-col gap-1.5 w-full">
    <span className="text-xs font-medium text-dim">{label}</span>
    {multiline ? (
      <textarea value={value ?? ""} rows={rows} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} py-2.5 resize-y`} />
    ) : (
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} py-2.5`} />
    )}
    {hint ? <span className="text-xs text-faint">{hint}</span> : null}
  </label>
);

// Read an image file, scaled down so documents with diagrams stay small.
export const readImage = (file, maxSide = 1600) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not an image."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
