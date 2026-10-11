import { useCallback, useEffect, useState } from "react";
import { notesApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { SkeletonNotes } from "../../components/ui/Skeleton";
import { PageHeader, Button, Dialog, Field, Empty, fmtDate } from "./ui";

export const Notes = () => {
  const { showToast } = useUI();
  const [notes, setNotes] = useState(null);
  const [form, setForm] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(() => notesApi.list().then(setNotes).catch((e) => showToast(e.message, "error")), [showToast]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim() && !form.body.trim()) return setForm(null);
    try {
      if (form.id) await notesApi.update(form.id, form);
      else await notesApi.create(form);
      setForm(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this note?")) return;
    await notesApi.remove(form.id);
    setForm(null);
    load();
  };

  const togglePin = async (n) => {
    await notesApi.update(n.id, { pinned: !n.pinned });
    load();
  };

  if (!notes) return <SkeletonNotes />;
  const q = query.trim().toLowerCase();
  const shown = notes.filter((n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(q));

  return (
    <>
      <PageHeader title="Notes" subtitle="Short notes for running Methynix." actions={<Button onClick={() => setForm({ title: "", body: "", pinned: false })}>New note</Button>} />
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes" className="w-full max-w-sm mb-5 bg-surface border border-line px-3 py-2 rounded-lg text-sm outline-none focus:border-accent" />

      {shown.length === 0 ? (
        <Empty>No notes yet.</Empty>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-4 [&>*]:mb-4">
          {shown.map((n) => (
            <div key={n.id} className={`break-inside-avoid rounded-2xl border bg-surface p-5 ${n.pinned ? "border-sand/40" : "border-line"}`}>
              <div className="flex items-start justify-between gap-3">
                <button className="text-left font-medium" onClick={() => setForm(n)}>{n.title || "Untitled"}</button>
                <button onClick={() => togglePin(n)} className={`text-xs ${n.pinned ? "text-sand" : "text-faint hover:text-text"}`}>{n.pinned ? "Pinned" : "Pin"}</button>
              </div>
              <button className="text-left w-full" onClick={() => setForm(n)}>
                <p className="text-sm text-dim mt-2 whitespace-pre-wrap line-clamp-[10]">{n.body}</p>
                <p className="text-[11px] text-faint mt-3">{fmtDate(n.updated_at)}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit note" : "New note"}
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
            <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Field label="Note" type="textarea" rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
        ) : null}
      </Dialog>
    </>
  );
};
