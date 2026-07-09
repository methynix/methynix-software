import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { Input } from "../../components/ui/Input";
import { SITE } from "../../constants/site";
import { DocumentsPanel } from "../../features/documents/DocumentsPanel";

const TABS = ["Documents", "What's new", "Work", "Site"];

const emptyPost = { title: "", body: "", image_url: "" };
const emptyProject = { name: "", type: "web", summary: "", url: "", image_url: "" };

const PostsPanel = ({ showToast }) => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyPost);
  const [saving, setSaving] = useState(false);

  const load = () => apiClient.get("/posts").then((r) => setPosts(r.data.data || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      showToast("Add a title and some text.", "error");
      return;
    }
    setSaving(true);
    try {
      await apiClient.post("/admin/posts", form);
      setForm(emptyPost);
      await load();
      showToast("Update published.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiClient.delete(`/admin/posts/${id}`);
      await load();
      showToast("Update removed.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={create} className="rounded-2xl border border-line bg-surface p-6 space-y-4 h-fit">
        <h2 className="font-display text-xl font-semibold">Post an update</h2>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="We launched a new site" />
        <Input label="Text" type="textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What happened, in a sentence or two." />
        <Input
          label="Image link (optional)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="https://..."
          hint="Paste a link to an image you have hosted. Leave empty for none."
        />
        <button type="submit" disabled={saving} className="w-full py-3 rounded-lg bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text transition-colors disabled:opacity-50">
          {saving ? "Publishing…" : "Publish update"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Published updates</h2>
        {posts.length === 0 ? (
          <p className="text-dim text-sm">Nothing published yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="rounded-xl border border-line bg-surface p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-dim line-clamp-2 mt-1">{p.body}</p>
                </div>
                <button onClick={() => remove(p.id)} className="text-sm text-red-300 hover:text-red-200 shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectsPanel = ({ showToast }) => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [saving, setSaving] = useState(false);

  const load = () => apiClient.get("/projects").then((r) => setProjects(r.data.data || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Add a project name.", "error");
      return;
    }
    setSaving(true);
    try {
      await apiClient.post("/admin/projects", form);
      setForm(emptyProject);
      await load();
      showToast("Project added.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiClient.delete(`/admin/projects/${id}`);
      await load();
      showToast("Project removed.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={create} className="rounded-2xl border border-line bg-surface p-6 space-y-4 h-fit">
        <h2 className="font-display text-xl font-semibold">Add a project</h2>
        <Input label="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mwananchi Retail" />
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-dim">Type</span>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-ink border border-line p-3.5 rounded-lg text-text outline-none focus:border-accent transition-colors"
          >
            <option value="web">Website</option>
            <option value="mobile">Mobile app</option>
            <option value="desktop">Desktop app</option>
          </select>
        </label>
        <Input label="One-line summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="A booking site for a clinic." />
        <Input label="Live link (optional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
        <Input
          label="Thumbnail image link (optional)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="https://..."
          hint="A screenshot of the site or app. Leave empty to show the project name instead."
        />
        <button type="submit" disabled={saving} className="w-full py-3 rounded-lg bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text transition-colors disabled:opacity-50">
          {saving ? "Adding…" : "Add project"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Your projects</h2>
        {projects.length === 0 ? (
          <p className="text-dim text-sm">No projects yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-line bg-surface p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-dim mt-1">{p.summary}</p>
                </div>
                <button onClick={() => remove(p.id)} className="text-sm text-red-300 hover:text-red-200 shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SitePanel = ({ showToast }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiClient.get("/site/status").then((r) => {
      setMaintenance(Boolean(r.data.maintenance));
      setLoaded(true);
    });
  }, []);

  const toggle = async () => {
    const next = !maintenance;
    try {
      await apiClient.patch("/admin/site", { maintenance: next });
      setMaintenance(next);
      showToast(next ? "Maintenance mode is on." : "Site is live again.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-7 max-w-xl">
      <h2 className="font-display text-xl font-semibold">Maintenance mode</h2>
      <p className="text-dim mt-2 leading-relaxed">
        When this is on, visitors see a short maintenance message instead of the
        site. You can still sign in here. Use it while you make big changes.
      </p>
      <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-ink p-4">
        <div>
          <p className="font-medium">Public site</p>
          <p className="text-sm text-dim">{loaded ? (maintenance ? "Showing maintenance message" : "Live and visible") : "Checking…"}</p>
        </div>
        <button
          onClick={toggle}
          disabled={!loaded}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            maintenance ? "bg-sand text-ink hover:opacity-90" : "bg-accent text-accentInk hover:bg-accentDeep hover:text-text"
          }`}
        >
          {maintenance ? "Turn off" : "Turn on"}
        </button>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { logout } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [tab, setTab] = useState(TABS[0]);

  const signOut = () => {
    logout();
    navigate("/admin");
  };

  return (
    <div className="max-w-page mx-auto px-5 md:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">Staff portal</p>
          <h1 className="font-display text-3xl font-semibold">{SITE.name} dashboard</h1>
        </div>
        <button onClick={signOut} className="text-sm text-dim hover:text-text border border-line rounded-lg px-4 py-2 transition-colors">
          Sign out
        </button>
      </div>

      <div className="flex gap-1 mt-8 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-accent text-text" : "border-transparent text-dim hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "Documents" ? <DocumentsPanel showToast={showToast} /> : null}
        {tab === "What's new" ? <PostsPanel showToast={showToast} /> : null}
        {tab === "Work" ? <ProjectsPanel showToast={showToast} /> : null}
        {tab === "Site" ? <SitePanel showToast={showToast} /> : null}
      </div>
    </div>
  );
};
