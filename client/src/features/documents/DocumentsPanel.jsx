import { useEffect, useState, useCallback } from "react";
import { DOC_TYPES, STATUS_OPTIONS } from "./company";
import { getBrand } from "./brands";
import { defaultWorking } from "./defaults";
import { formatTZS, formatDate } from "./format";
import { downloadPdf } from "./pdf/render";
import { DocumentEditor, BrandSwitch } from "./DocumentEditor";
import { listDocuments, updateDocument, deleteDocument } from "./documentsApi";
import { SkeletonTable } from "../../components/ui/Skeleton";

export const StatusPill = ({ status }) => {
  const tone =
    status === "paid" || status === "signed" || status === "accepted"
      ? "bg-accent/15 text-accent border-accent/30"
      : status === "void"
      ? "bg-red-500/10 text-red-300 border-red-500/30"
      : status === "sent"
      ? "bg-sand/10 text-sand border-sand/30"
      : "bg-line/40 text-dim border-line";
  return <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tone}`}>{status}</span>;
};

// Stand-alone documents (not tied to a pipeline project). Documents made from a
// project also show up here, tagged with the project.
export const DocumentsPanel = ({ showToast }) => {
  const [type, setType] = useState("proposal");
  const [brand, setBrand] = useState("methynix");
  const [working, setWorking] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [docs, setDocs] = useState(null);

  const loadList = useCallback(
    (t) => listDocuments(t).then(setDocs).catch((e) => showToast(e.message, "error")),
    [showToast]
  );

  useEffect(() => {
    loadList(type);
  }, [type, loadList]);

  const switchType = (t) => {
    setWorking(null);
    setEditingId(null);
    setDocs(null);
    setType(t);
  };

  const startNew = () => {
    setEditingId(null);
    setWorking(defaultWorking(type, { brand }));
  };

  const open = (doc) => {
    setEditingId(doc.id);
    setWorking({ ...doc, client: { name: "", email: "", phone: "", address: "", ...doc.client } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeStatus = async (doc, status) => {
    try {
      await updateDocument(doc.id, { status });
      loadList(type);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async (doc) => {
    if (!window.confirm(`Delete ${doc.data?.reference || doc.number}? This cannot be undone.`)) return;
    try {
      await deleteDocument(doc.id);
      if (editingId === doc.id) setWorking(null);
      loadList(type);
      showToast("Document deleted.");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const label = DOC_TYPES.find((t) => t.key === type)?.label || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
          {DOC_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => switchType(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t.key ? "bg-raised text-text" : "text-dim hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {!working ? (
          <div className="flex flex-wrap items-center gap-3">
            <BrandSwitch value={brand} onChange={setBrand} />
            <button onClick={startNew} className="px-4 py-2.5 rounded-lg bg-accent text-accentInk text-sm font-medium hover:bg-accentDeep hover:text-text transition-colors">
              New {label.toLowerCase()}
            </button>
          </div>
        ) : null}
      </div>

      <p className="text-sm text-dim">
        Tip: for client work, generate documents from the project in <span className="text-text">Clients</span> — they are
        pre-filled and can be emailed and filed in R2 from there.
      </p>

      {working ? (
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-7">
          <DocumentEditor
            doc={working}
            onChange={setWorking}
            docId={editingId}
            showToast={showToast}
            onSaved={(saved) => {
              setEditingId(saved.id);
              loadList(type);
            }}
            onCancel={() => setWorking(null)}
          />
        </div>
      ) : null}

      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Saved {label.toLowerCase()}s</h2>
        {!docs ? (
          <SkeletonTable rows={4} cols={3} />
        ) : docs.length === 0 ? (
          <p className="text-dim text-sm">Nothing saved yet.</p>
        ) : (
          <div className="rounded-2xl border border-line bg-surface divide-y divide-line">
            {docs.map((doc) => (
              <div key={doc.id} className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium flex flex-wrap items-center gap-2">
                    <span>{doc.data?.reference || doc.number}</span>
                    <StatusPill status={doc.status} />
                    <span className="text-[11px] text-faint">{getBrand(doc.data?.brand).label}</span>
                  </p>
                  <p className="text-sm text-dim truncate">
                    {doc.client?.name || "—"}
                    {doc.data?.projectTitle ? ` · ${doc.data.projectTitle}` : ""}
                  </p>
                  <p className="text-xs text-faint mt-0.5">
                    {formatDate(doc.created_at?.slice(0, 10))}
                    {doc.total ? ` · TZS ${formatTZS(doc.total)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button onClick={() => downloadPdf(doc).catch((e) => showToast(e.message, "error"))} className="text-accent hover:text-accentDeep">Download</button>
                  <button onClick={() => open(doc)} className="text-dim hover:text-text">Edit</button>
                  <select
                    value={doc.status}
                    onChange={(e) => changeStatus(doc, e.target.value)}
                    className="bg-ink border border-line rounded px-1.5 py-1 text-xs text-text outline-none focus:border-accent"
                    aria-label="Status"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(doc)} className="text-red-300 hover:text-red-200">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
