import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { galleryApi, fileToBase64 } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { PageHeader, Button, Dialog, Field, Empty, fmtDate } from "./ui";

const MAX_UPLOAD = 25 * 1024 * 1024;
const isImage = (f) => (f.content_type || "").startsWith("image/");
const kb = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const ext = (name) => (name.includes(".") ? name.split(".").pop().slice(0, 4).toUpperCase() : "FILE");

export const Gallery = () => {
  const { showToast } = useUI();
  const [items, setItems] = useState(null);
  const [album, setAlbum] = useState("all");
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState(null);
  const [importing, setImporting] = useState(null); // { items, picked, album }
  const [busy, setBusy] = useState("");
  const [uploadAlbum, setUploadAlbum] = useState("");
  const input = useRef(null);

  const load = useCallback(() => galleryApi.list().then(setItems).catch((e) => showToast(e.message, "error")), [showToast]);
  useEffect(() => { load(); }, [load]);

  const albums = useMemo(() => [...new Set((items || []).map((i) => i.album).filter(Boolean))].sort(), [items]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter(
      (i) => (album === "all" || (album === "none" ? !i.album : i.album === album)) && (!q || `${i.name} ${i.note} ${i.album}`.toLowerCase().includes(q))
    );
  }, [items, album, query]);

  const upload = async (files) => {
    const list = [...files];
    if (!list.length) return;
    setBusy("upload");
    let done = 0;
    for (const file of list) {
      if (file.size > MAX_UPLOAD) { showToast(`${file.name} is over 25 MB and was skipped.`, "error"); continue; }
      try {
        await galleryApi.upload({ filename: file.name, content_type: file.type, album: uploadAlbum || (album !== "all" && album !== "none" ? album : ""), data: await fileToBase64(file) });
        done++;
      } catch (e) {
        showToast(`${file.name}: ${e.message}`, "error");
      }
    }
    setBusy("");
    if (input.current) input.current.value = "";
    if (done) showToast(`${done} file${done === 1 ? "" : "s"} uploaded.`);
    load();
  };

  const open = async (f, download) => {
    try {
      const url = await galleryApi.url(f.id, download);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const save = async () => {
    try {
      await galleryApi.update(edit.id, { name: edit.name, album: edit.album, note: edit.note });
      setEdit(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async () => {
    if (!window.confirm(edit.imported ? `Remove ${edit.name} from the gallery? The file stays in the bucket.` : `Delete ${edit.name} permanently?`)) return;
    await galleryApi.remove(edit.id);
    setEdit(null);
    load();
  };

  const openImport = async () => {
    setImporting({ items: null, picked: {}, album: "" });
    try {
      setImporting((s) => ({ ...s, items: [] }));
      const found = await galleryApi.unlinked();
      setImporting((s) => ({ ...s, items: found }));
    } catch (e) {
      setImporting(null);
      showToast(e.message, "error");
    }
  };

  const doImport = async () => {
    const keys = Object.keys(importing.picked).filter((k) => importing.picked[k]);
    if (!keys.length) return showToast("Tick at least one file.", "error");
    setBusy("import");
    try {
      await galleryApi.link(keys, importing.album);
      setImporting(null);
      load();
      showToast("Files added. Nothing was re-uploaded.");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  if (!items) return <p className="text-sm text-dim">Loading…</p>;

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Your private photos and documents. Stored in a private bucket and opened only through short-lived links."
        actions={
          <>
            <Button variant="ghost" onClick={openImport}>Add from bucket</Button>
            <Button onClick={() => input.current?.click()} disabled={busy === "upload"}>{busy === "upload" ? "Uploading…" : "Upload"}</Button>
            <input ref={input} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files" className="flex-1 min-w-[200px] max-w-sm bg-surface border border-line px-3 py-2 rounded-lg text-sm outline-none focus:border-accent" />
        <input value={uploadAlbum} onChange={(e) => setUploadAlbum(e.target.value)} list="gallery-albums" placeholder="Album for new uploads" className="w-52 bg-surface border border-line px-3 py-2 rounded-lg text-sm outline-none focus:border-accent" />
        <datalist id="gallery-albums">{albums.map((a) => <option key={a} value={a} />)}</datalist>
      </div>

      <div className="flex flex-wrap gap-1 mb-5">
        {[["all", `All (${items.length})`], ...albums.map((a) => [a, a]), ["none", "No album"]].map(([k, label]) => (
          <button key={k} onClick={() => setAlbum(k)} className={`px-3 py-1.5 text-xs rounded-lg ${album === k ? "bg-raised text-text" : "text-dim hover:text-text"}`}>{label}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty>{items.length ? "Nothing matches." : "Nothing here yet. Upload photos or documents, or add what is already in the bucket."}</Empty>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {shown.map((f) => (
            <div key={f.id} className="rounded-xl border border-line bg-surface overflow-hidden group">
              <button onClick={() => open(f)} className="block w-full aspect-square bg-raised/40 overflow-hidden" aria-label={`Open ${f.name}`}>
                {isImage(f) && f.preview_url ? (
                  <img src={f.preview_url} alt={f.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <span className="flex h-full items-center justify-center text-lg font-semibold text-faint">{ext(f.name)}</span>
                )}
              </button>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate">{f.name}</p>
                <p className="text-[11px] text-faint truncate">{f.album || "No album"} · {kb(f.size)} · {fmtDate(f.created_at)}</p>
                <div className="flex gap-3 mt-1.5 text-[11px]">
                  <button className="text-accent" onClick={() => open(f, true)}>Download</button>
                  <button className="text-dim hover:text-text" onClick={() => setEdit({ ...f })}>Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(edit)} onClose={() => setEdit(null)} title="Edit file" footer={<><Button variant="danger" onClick={remove}>{edit?.imported ? "Remove" : "Delete"}</Button><Button variant="subtle" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        {edit ? (
          <div className="space-y-3">
            <Field label="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <Field label="Album" value={edit.album} onChange={(e) => setEdit({ ...edit, album: e.target.value })} list="gallery-albums" placeholder="e.g. Personal, IDs, Receipts" />
            <Field label="Note" type="textarea" value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} />
          </div>
        ) : null}
      </Dialog>

      <Dialog open={Boolean(importing)} onClose={() => setImporting(null)} title="Add files already in the bucket" footer={<><Button variant="subtle" onClick={() => setImporting(null)}>Cancel</Button><Button onClick={doImport} disabled={busy === "import"}>{busy === "import" ? "Adding…" : "Add selected"}</Button></>}>
        {importing ? (
          <div className="space-y-3">
            {!importing.items ? <p className="text-sm text-dim">Loading…</p> : importing.items.length === 0 ? (
              <p className="text-sm text-dim">Everything in the bucket is already in the gallery.</p>
            ) : (
              <ul className="divide-y divide-line max-h-72 overflow-y-auto rounded-lg border border-line">
                {importing.items.map((o) => (
                  <li key={o.key}>
                    <label className="px-3 py-2 flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={Boolean(importing.picked[o.key])} onChange={(e) => setImporting({ ...importing, picked: { ...importing.picked, [o.key]: e.target.checked } })} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm truncate">{o.key.split("/").pop()}</span>
                        <span className="block text-[11px] text-faint truncate">{o.key} · {kb(o.size)}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <Field label="Put them in album (optional)" value={importing.album} onChange={(e) => setImporting({ ...importing, album: e.target.value })} list="gallery-albums" />
            <p className="text-xs text-faint">Adds them to the gallery without uploading again. Removing one later only unlinks it; the file stays in the bucket.</p>
          </div>
        ) : null}
      </Dialog>
    </>
  );
};
