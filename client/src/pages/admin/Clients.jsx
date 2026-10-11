import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { clientsApi } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { SkeletonBoard } from "../../components/ui/Skeleton";
import { PageHeader, Button, Dialog, Pill, Empty, money, fmtDate, dueLabel, dueTone } from "./ui";
import { BOARD, STAGES, stage } from "./constants";
import { LeadForm, emptyLead, leadPayload } from "./LeadForm";

const ProjectCard = ({ p }) => {
  const s = stage(p.status);
  const pct = p.quote ? Math.min(100, Math.round((p.paid / p.quote) * 100)) : 0;
  return (
    <Link to={`/admin/dashboard/clients/${p.id}`} className="block rounded-xl border border-line bg-surface p-3.5 hover:border-accent/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{p.name}</p>
        <Pill tone={s.tone}>{s.label}</Pill>
      </div>
      <p className="text-xs text-dim mt-1 truncate">{p.client.company || p.client.name || "No client name"}</p>
      {p.quote ? (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-raised overflow-hidden">
            <div className="h-full bg-accent/70 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-faint mt-1 tabular-nums">{money(p.paid)} of {money(p.quote)}</p>
        </div>
      ) : null}
      {p.deadline ? <p className={`text-[11px] mt-2 ${dueTone(p.deadline)}`}>Due {fmtDate(p.deadline)} · {dueLabel(p.deadline)}</p> : null}
    </Link>
  );
};

export const Clients = () => {
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState(null);
  const [view, setView] = useState(() => {
    try { return localStorage.getItem("mtx_clients_view") || "board"; } catch { return "board"; }
  });
  const [query, setQuery] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  // "?new=1" (from Overview / Projects) opens the new-lead form straight away.
  const [form, setForm] = useState(() => (params.get("new") ? emptyLead() : null));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientsApi.list().then(setProjects).catch((e) => showToast(e.message, "error"));
  }, [showToast]);

  useEffect(() => {
    if (params.get("new")) setParams({}, { replace: true });
  }, [params, setParams]);

  const switchView = (v) => {
    setView(v);
    try { localStorage.setItem("mtx_clients_view", v); } catch { /* storage unavailable */ }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (projects || []).filter(
      (p) => !q || [p.name, p.client.name, p.client.company, p.client.email].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [projects, query]);

  const create = async () => {
    if (!form.name.trim()) return showToast("Give the project a name.", "error");
    setSaving(true);
    try {
      const created = await clientsApi.create(leadPayload(form));
      showToast("Lead created.");
      navigate(`/admin/dashboard/clients/${created.id}`);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const closed = filtered.filter((p) => ["on_hold", "lost"].includes(p.status));

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Every lead and client project, from first contact to completion."
        actions={<Button onClick={() => setForm(emptyLead())}>New lead</Button>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects or clients"
          className="flex-1 min-w-[200px] max-w-sm bg-surface border border-line px-3 py-2 rounded-lg text-sm outline-none focus:border-accent"
        />
        <div className="inline-flex rounded-lg border border-line p-0.5 bg-surface">
          {["board", "list"].map((v) => (
            <button key={v} onClick={() => switchView(v)} className={`px-3 py-1.5 text-xs rounded-md capitalize ${view === v ? "bg-raised text-text" : "text-dim"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {!projects ? (
        <SkeletonBoard />
      ) : projects.length === 0 ? (
        <Empty>No clients yet. Create your first lead when someone gets in touch.</Empty>
      ) : view === "board" ? (
        <>
          <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-4 overflow-x-auto pb-3">
            {BOARD.map((col) => {
              const items = filtered.filter((p) => col.keys.includes(p.status));
              return (
                <div key={col.label} className="rounded-2xl bg-surface/40 border border-line p-3 min-h-[200px]">
                  <div className="flex items-center justify-between px-1 mb-3">
                    <p className="text-sm font-semibold">{col.label}</p>
                    <span className="text-xs text-faint tabular-nums">{items.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {items.map((p) => <ProjectCard key={p.id} p={p} />)}
                  </div>
                </div>
              );
            })}
          </div>
          {closed.length ? (
            <div className="mt-4">
              <button onClick={() => setShowClosed(!showClosed)} className="text-sm text-dim hover:text-text">
                {showClosed ? "Hide" : "Show"} on hold & lost ({closed.length})
              </button>
              {showClosed ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  {closed.map((p) => <ProjectCard key={p.id} p={p} />)}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs text-faint border-b border-line">
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Paid</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-raised/30 cursor-pointer" onClick={() => navigate(`/admin/dashboard/clients/${p.id}`)}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-dim">{p.client.company || p.client.name}</td>
                  <td className="px-4 py-3"><Pill tone={stage(p.status).tone}>{stage(p.status).label}</Pill></td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.quote ? money(p.quote) : "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(p.paid)}</td>
                  <td className={`px-4 py-3 ${dueTone(p.deadline)}`}>{p.deadline ? `${fmtDate(p.deadline)} · ${dueLabel(p.deadline)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title="New lead"
        wide
        footer={
          <>
            <Button variant="subtle" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={create} disabled={saving}>{saving ? "Creating…" : "Create lead"}</Button>
          </>
        }
      >
        {form ? <LeadForm value={form} onChange={setForm} /> : null}
        <p className="text-xs text-faint mt-4">
          A folder named after the project is created in the R2 bucket. Stages: {STAGES.length - 2} steps from lead to completed.
        </p>
      </Dialog>
    </>
  );
};
