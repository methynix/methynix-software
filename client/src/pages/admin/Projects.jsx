import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studioApi, clientsApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { SkeletonProjects } from "../../components/ui/Skeleton";
import { PageHeader, Button, Dialog, Field, Select, Pill, Empty, fmtDate, toInputDate, dueLabel, dueTone } from "./ui";
import { stage } from "./constants";

const TABS = [
  { key: "mother", label: "Mother projects", blurb: "The big Methynix products and long-term bets." },
  { key: "hobby", label: "Hobby projects", blurb: "Side projects and experiments." },
  { key: "client", label: "Client projects", blurb: "Work for clients — managed in Clients." },
];

const STATUSES = [
  { value: "idea", label: "Idea", tone: "neutral" },
  { value: "planning", label: "Planning", tone: "blue" },
  { value: "in_progress", label: "In progress", tone: "accent" },
  { value: "paused", label: "Paused", tone: "sand" },
  { value: "done", label: "Done", tone: "neutral" },
];
const statusOf = (v) => STATUSES.find((s) => s.value === v) || STATUSES[0];

const blank = (category) => ({ name: "", category, status: "idea", description: "", url: "", deadline: "" });

export const Projects = () => {
  const { showToast } = useUI();
  const [tab, setTab] = useState("mother");
  const [items, setItems] = useState(null);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(null);

  const load = useCallback(() => {
    Promise.all([studioApi.list(), clientsApi.list()])
      .then(([s, c]) => {
        setItems(s);
        setClients(c);
      })
      .catch((e) => showToast(e.message, "error"));
  }, [showToast]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim()) return showToast("Give it a name.", "error");
    const body = { ...form, deadline: form.deadline || null };
    try {
      if (form.id) await studioApi.update(form.id, body);
      else await studioApi.create(body);
      setForm(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${form.name}?`)) return;
    await studioApi.remove(form.id);
    setForm(null);
    load();
  };

  const quickStatus = async (p, status) => {
    await studioApi.update(p.id, { status });
    load();
  };

  if (!items) return <SkeletonProjects />;
  const current = TABS.find((t) => t.key === tab);
  const list =
    tab === "client"
      ? clients.map((c) => ({ id: c.id, name: c.name, description: c.client.company || c.client.name, deadline: c.deadline, clientStatus: c.status }))
      : items.filter((p) => p.category === tab).sort((a, b) => (a.status === "done") - (b.status === "done"));

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Reminder emails go out a week before any deadline."
        actions={tab !== "client" ? <Button onClick={() => setForm(blank(tab))}>New {tab} project</Button> : <Link to="/admin/dashboard/clients?new=1" className="px-3.5 py-2 rounded-lg text-sm bg-accent text-accentInk font-medium">New lead</Link>}
      />

      <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 w-fit mb-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm ${tab === t.key ? "bg-raised text-text" : "text-dim hover:text-text"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-dim mb-5">{current.blurb}</p>

      {list.length === 0 ? (
        <Empty>Nothing here yet.</Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((p) => {
            const st = p.clientStatus ? { label: stage(p.clientStatus).label, tone: stage(p.clientStatus).tone } : statusOf(p.status);
            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{p.name}</p>
                  <Pill tone={st.tone}>{st.label}</Pill>
                </div>
                {p.description ? <p className="text-sm text-dim mt-2 line-clamp-3 whitespace-pre-wrap">{p.description}</p> : null}
                <div className="flex items-center justify-between mt-4 text-xs">
                  {p.deadline ? <span className={dueTone(p.deadline)}>Due {fmtDate(p.deadline)} · {dueLabel(p.deadline)}</span> : <span className="text-faint">No deadline</span>}
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-accent">Open ↗</a> : null}
                </div>
              </>
            );
            return tab === "client" ? (
              <Link key={p.id} to={`/admin/dashboard/clients/${p.id}`} className="rounded-2xl border border-line bg-surface p-5 hover:border-accent/40 transition-colors">{body}</Link>
            ) : (
              <div key={p.id} className="rounded-2xl border border-line bg-surface p-5">
                <button className="text-left w-full" onClick={() => setForm({ ...p, deadline: toInputDate(p.deadline) })}>{body}</button>
                <div className="flex gap-1 mt-4 pt-3 border-t border-line flex-wrap">
                  {STATUSES.map((s) => (
                    <button key={s.value} onClick={() => quickStatus(p, s.value)} className={`text-[11px] px-2 py-1 rounded-md ${p.status === s.value ? "bg-raised text-text" : "text-faint hover:text-text"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit project" : "New project"}
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
            <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={[{ value: "mother", label: "Mother project" }, { value: "hobby", label: "Hobby project" }]} />
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} />
              <Field label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              <Field label="Link" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://" />
            </div>
            <Field label="Description" type="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        ) : null}
      </Dialog>
    </>
  );
};
