import { useState } from "react";
import { FormSection, ListEditor, RowsEditor, TableEditor, TextField, readImage } from "./fields";

const BLOCK_TYPES = [
  { type: "heading", label: "Sub-heading", make: () => ({ type: "heading", text: "" }) },
  { type: "paragraph", label: "Paragraph", make: () => ({ type: "paragraph", text: "" }) },
  { type: "bullets", label: "Bullets", make: () => ({ type: "bullets", items: [""] }) },
  { type: "numbered", label: "Numbered list", make: () => ({ type: "numbered", items: [""] }) },
  { type: "table", label: "Table", make: () => ({ type: "table", caption: "", columns: ["Column 1", "Column 2"], rows: [["", ""]] }) },
  { type: "image", label: "Diagram / image", make: () => ({ type: "image", src: null, caption: "" }) },
];

const LABEL = Object.fromEntries(BLOCK_TYPES.map((b) => [b.type, b.label]));

const swap = (arr, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

const SmallButton = ({ children, danger, ...props }) => (
  <button
    type="button"
    {...props}
    className={`text-xs px-2 py-1 rounded-md border border-line transition-colors ${danger ? "text-red-300 hover:border-red-400/50" : "text-dim hover:text-text"}`}
  >
    {children}
  </button>
);

const ImageBlock = ({ block, onChange }) => {
  const [error, setError] = useState("");
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      onChange({ ...block, src: await readImage(file) });
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="space-y-2">
      {block.src ? <img src={block.src} alt="" className="max-h-56 rounded-lg border border-line bg-white" /> : null}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-accent cursor-pointer hover:text-accentDeep">
          {block.src ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" onChange={pick} className="hidden" />
        </label>
        {block.src ? <SmallButton danger onClick={() => onChange({ ...block, src: null })}>Remove image</SmallButton> : null}
        {error ? <span className="text-xs text-red-300">{error}</span> : null}
      </div>
      <TextField label="Caption" value={block.caption} onChange={(v) => onChange({ ...block, caption: v })} placeholder="System Architecture" hint="Shown as “Figure n: caption”. Blocks without an image are skipped in the PDF." />
    </div>
  );
};

const BlockEditor = ({ block, onChange }) => {
  switch (block.type) {
    case "heading":
      return <input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Sub-heading" className="w-full bg-ink border border-line px-3 py-2 rounded-lg text-sm font-semibold text-text outline-none focus:border-accent" />;
    case "paragraph":
      return <TextField label="" multiline rows={4} value={block.text} onChange={(v) => onChange({ ...block, text: v })} />;
    case "bullets":
    case "numbered":
      return <ListEditor items={block.items} onChange={(items) => onChange({ ...block, items })} multiline />;
    case "table":
      return (
        <div className="space-y-2">
          <TextField label="Table caption (optional)" value={block.caption} onChange={(v) => onChange({ ...block, caption: v })} placeholder="users  Every person who logs in." />
          <TableEditor columns={block.columns} rows={block.rows} onChange={(t) => onChange({ ...block, ...t, widths: t.columns.length === block.columns.length ? block.widths : undefined })} />
        </div>
      );
    case "image":
      return <ImageBlock block={block} onChange={onChange} />;
    default:
      return null;
  }
};

const SectionEditor = ({ section, number, onChange, onMove, onRemove }) => {
  const [open, setOpen] = useState(false);
  const blocks = section.blocks || [];
  const setBlocks = (next) => onChange({ ...section, blocks: next });
  let sub = 0;

  return (
    <div className="rounded-xl border border-line bg-ink/40">
      <div className="flex items-center gap-2 p-3">
        <button type="button" onClick={() => setOpen(!open)} className="text-dim hover:text-text w-6" aria-label={open ? "Collapse" : "Expand"}>
          {open ? "▾" : "▸"}
        </button>
        <span className="text-sm text-faint tabular-nums w-6">{number}</span>
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="flex-1 bg-transparent text-sm font-semibold text-text outline-none border-b border-transparent focus:border-accent py-1"
        />
        <span className="text-xs text-faint hidden sm:inline">{blocks.length} blocks</span>
        <SmallButton onClick={() => onMove(-1)}>↑</SmallButton>
        <SmallButton onClick={() => onMove(1)}>↓</SmallButton>
        <SmallButton danger onClick={onRemove}>Delete</SmallButton>
      </div>

      {open ? (
        <div className="px-3 pb-4 space-y-3">
          {blocks.map((b, i) => {
            const heading = b.type === "heading" ? `${number}.${++sub}` : null;
            return (
              <div key={i} className="rounded-lg border border-line bg-surface p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wide text-faint flex-1">
                    {heading ? `${heading} · ` : ""}{LABEL[b.type]}
                  </span>
                  <SmallButton onClick={() => setBlocks(swap(blocks, i, -1))}>↑</SmallButton>
                  <SmallButton onClick={() => setBlocks(swap(blocks, i, 1))}>↓</SmallButton>
                  <SmallButton danger onClick={() => setBlocks(blocks.filter((_, k) => k !== i))}>✕</SmallButton>
                </div>
                <BlockEditor block={b} onChange={(nb) => setBlocks(blocks.map((x, k) => (k === i ? nb : x)))} />
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 pt-1">
            {BLOCK_TYPES.map((t) => (
              <SmallButton key={t.type} onClick={() => setBlocks([...blocks, t.make()])}>+ {t.label}</SmallButton>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const TechnicalForm = ({ value, onChange }) => {
  const d = value.data;
  const sections = d.sections || [];
  const patch = (partial) => onChange({ ...value, data: { ...d, ...partial } });
  const patchClient = (partial) => onChange({ ...value, client: { ...value.client, ...partial } });
  const setSections = (next) => patch({ sections: next });

  return (
    <div className="space-y-6">
      <FormSection title="Cover page">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="System title" value={d.projectTitle} onChange={(v) => patch({ projectTitle: v })} />
          <TextField label="Prepared for (client)" value={value.client.name} onChange={(v) => patchClient({ name: v })} />
          <TextField label="Client email" value={value.client.email} onChange={(v) => patchClient({ email: v })} />
          <TextField label="Reference no." value={d.reference} onChange={(v) => patch({ reference: v })} placeholder="NTD-0008" />
          <TextField label="Version" value={d.version} onChange={(v) => patch({ version: v })} />
          <TextField label="Status" value={d.docStatus} onChange={(v) => patch({ docStatus: v })} />
          <TextField label="Date" type="date" value={d.date} onChange={(v) => patch({ date: v })} />
          <TextField label="Prepared by" value={d.preparedBy} onChange={(v) => patch({ preparedBy: v })} />
        </div>
      </FormSection>

      <FormSection title="Document control — versions">
        <RowsEditor
          rows={d.versions || []}
          onChange={(versions) => patch({ versions })}
          blank={{ version: "", date: "", author: d.preparedBy || "", changes: "" }}
          fields={[
            { key: "version", label: "Version", width: "70px" },
            { key: "date", label: "Date (YYYY-MM-DD)", width: "130px" },
            { key: "author", label: "Author", width: "1fr" },
            { key: "changes", label: "Changes", width: "2fr", multiline: true },
          ]}
        />
      </FormSection>

      <FormSection title="Document control — reviewed / approved by">
        <RowsEditor
          rows={d.approvals || []}
          onChange={(approvals) => patch({ approvals })}
          blank={{ name: "", role: "", date: "" }}
          fields={[
            { key: "name", label: "Name" },
            { key: "role", label: "Role" },
            { key: "date", label: "Date (YYYY-MM-DD)", width: "150px" },
          ]}
        />
      </FormSection>

      <FormSection
        title="Sections"
        hint="Numbering is automatic. A sign-off section is always added at the end. Click a section to open it."
        actions={
          <SmallButton onClick={() => setSections([...sections, { title: "New section", blocks: [{ type: "paragraph", text: "" }] }])}>
            + Section
          </SmallButton>
        }
      >
        <div className="space-y-2">
          {sections.map((s, i) => (
            <SectionEditor
              key={i}
              section={s}
              number={i + 1}
              onChange={(ns) => setSections(sections.map((x, k) => (k === i ? ns : x)))}
              onMove={(dir) => setSections(swap(sections, i, dir))}
              onRemove={() => setSections(sections.filter((_, k) => k !== i))}
            />
          ))}
        </div>
      </FormSection>
    </div>
  );
};
