import { useEffect, useState, useCallback } from "react";
import { DOC_TYPES, STATUS_OPTIONS } from "./company";
import { defaultWorking } from "./defaults";
import { formatTZS, formatDate } from "./format";
import { InvoiceForm } from "./forms/InvoiceForm";
import { ReceiptForm } from "./forms/ReceiptForm";
import { ContractForm } from "./forms/ContractForm";
import { downloadPdf, previewPdf } from "./pdf/render";
import { listDocuments, getNextNumber, createDocument, updateDocument, deleteDocument } from "./documentsApi";

const FORMS = { invoice: InvoiceForm, receipt: ReceiptForm, contract: ContractForm };

const StatusPill = ({ status }) => {
  const tone =
    status === "paid" || status === "signed"
      ? "bg-accent/15 text-accent border-accent/30"
      : status === "void"
      ? "bg-red-500/10 text-red-300 border-red-500/30"
      : "bg-line/40 text-dim border-line";
  return <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tone}`}>{status}</span>;
};

export const DocumentsPanel = ({ showToast }) => {
  const [type, setType] = useState("invoice");
  const [working, setWorking] = useState(() => defaultWorking("invoice"));
  const [editingId, setEditingId] = useState(null);
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);

  const loadList = useCallback((t) => {
    listDocuments(t).then(setDocs).catch((e) => showToast(e.message, "error"));
  }, [showToast]);

  const startNew = useCallback(async (t) => {
    setEditingId(null);
    const fresh = defaultWorking(t);
    setWorking(fresh);
    try {
      const { number } = await getNextNumber(t);
      setWorking((w) => (w.type === t ? { ...w, number } : w));
    } catch {
      /* number is cosmetic before save; ignore */
    }
  }, []);

  useEffect(() => {
    startNew(type);
    loadList(type);
  }, [type, startNew, loadList]);

  const Form = FORMS[type];

  const save = async () => {
    if (!working.client.name.trim()) {
      showToast("Add the client name first.", "error");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        type: working.type,
        title: working.title,
        client: working.client,
        data: working.data,
        total: working.total,
        status: working.status,
      };
      if (editingId) {
        await updateDocument(editingId, payload);
        showToast("Document updated.");
      } else {
        const created = await createDocument(payload);
        setWorking((w) => ({ ...w, number: created.number }));
        showToast(`Saved as ${created.number}.`);
      }
      loadList(type);
      if (!editingId) startNew(type);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const doDownload = async () => {
    try {
      await downloadPdf(working);
    } catch (e) {
      showToast(e.message || "Could not build the PDF.", "error");
    }
  };
  const doPreview = async () => {
    try {
      await previewPdf(working);
    } catch (e) {
      showToast(e.message || "Could not build the PDF.", "error");
    }
  };

  const loadDoc = (doc) => {
    setEditingId(doc.id);
    setWorking({
      type: doc.type,
      number: doc.number,
      status: doc.status,
      title: doc.title || "",
      client: { name: "", email: "", phone: "", address: "", ...doc.client },
      data: doc.data || {},
      total: doc.total || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeStatus = async (doc, status) => {
    try {
      await updateDocument(doc.id, { status });
      loadList(type);
      if (editingId === doc.id) setWorking((w) => ({ ...w, status }));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async (doc) => {
    try {
      await deleteDocument(doc.id);
      loadList(type);
      if (editingId === doc.id) startNew(type);
      showToast("Document deleted.");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {DOC_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              type === t.key ? "bg-accent text-accentInk border-accent" : "border-line text-dim hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Editor */}
        <div className="xl:col-span-3 rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">
                {editingId ? "Edit" : "New"} {DOC_TYPES.find((t) => t.key === type)?.label.toLowerCase()}
              </h2>
              <p className="text-sm text-dim mt-0.5">
                No. <span className="text-text font-medium">{working.number || "—"}</span>
                {editingId ? " · editing saved document" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-dim">Status</label>
              <select
                value={working.status}
                onChange={(e) => setWorking({ ...working, status: e.target.value })}
                className="bg-ink border border-line rounded-lg px-2 py-1.5 text-sm text-text outline-none focus:border-accent"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Only render a form once the working doc matches the selected type.
              Otherwise a tab switch renders e.g. ContractForm against invoice
              data (no `stages`) for one frame and crashes the panel. */}
          {working.type === type ? (
            <Form value={working} onChange={setWorking} />
          ) : (
            <p className="text-dim text-sm">Loading…</p>
          )}

          <div className="flex flex-wrap gap-3 mt-7 pt-5 border-t border-line">
            <button onClick={doPreview} className="px-4 py-2.5 rounded-lg border border-line text-sm text-dim hover:text-text transition-colors">
              Preview PDF
            </button>
            <button onClick={doDownload} className="px-4 py-2.5 rounded-lg border border-accent/40 text-sm text-accent hover:bg-accent/10 transition-colors">
              Download PDF
            </button>
            <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-lg bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text transition-colors disabled:opacity-50">
              {busy ? "Saving…" : editingId ? "Update" : "Save to history"}
            </button>
            {editingId ? (
              <button onClick={() => startNew(type)} className="px-4 py-2.5 rounded-lg text-sm text-dim hover:text-text transition-colors">
                Cancel edit
              </button>
            ) : null}
          </div>
        </div>

        {/* History */}
        <div className="xl:col-span-2">
          <h2 className="font-display text-xl font-semibold mb-4">Saved {DOC_TYPES.find((t) => t.key === type)?.label.toLowerCase()}s</h2>
          {docs.length === 0 ? (
            <p className="text-dim text-sm">Nothing saved yet.</p>
          ) : (
            <div className="space-y-3">
              {docs.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium flex items-center gap-2">
                        <span>{doc.number}</span>
                        <StatusPill status={doc.status} />
                      </p>
                      <p className="text-sm text-dim truncate">{doc.client?.name || "—"}</p>
                      <p className="text-xs text-faint mt-0.5">
                        {formatDate(doc.created_at?.slice(0, 10))} · TZS {formatTZS(doc.total)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                    <button onClick={() => downloadPdf(doc).catch((e) => showToast(e.message, "error"))} className="text-accent hover:text-accentDeep">Download</button>
                    <button onClick={() => loadDoc(doc)} className="text-dim hover:text-text">Edit</button>
                    <select
                      value={doc.status}
                      onChange={(e) => changeStatus(doc, e.target.value)}
                      className="bg-ink border border-line rounded px-1.5 py-1 text-xs text-text outline-none focus:border-accent ml-auto"
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
    </div>
  );
};
