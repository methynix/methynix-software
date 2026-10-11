import { useState } from "react";
import { BRAND_LIST, getBrand } from "./brands";
import { STATUS_OPTIONS, DOC_TYPES } from "./company";
import { rebrand } from "./defaults";
import { toNumber } from "./format";
import { ProposalForm } from "./forms/ProposalForm";
import { AgreementForm } from "./forms/AgreementForm";
import { TechnicalForm } from "./forms/TechnicalForm";
import { ReceiptForm } from "./forms/ReceiptForm";
import { downloadPdf, previewPdf, toBase64, pdfFilename } from "./pdf/render";
import { createDocument, updateDocument } from "./documentsApi";
import { clientsApi } from "../../api/adminApi";

const FORMS = { proposal: ProposalForm, contract: AgreementForm, technical: TechnicalForm, receipt: ReceiptForm };

const firstName = (name = "") => name.trim().split(/\s+/)[0] || "there";

// Default email wording for each document type.
export const defaultEmail = (doc) => {
  const d = doc.data || {};
  const brand = getBrand(d.brand);
  const ref = d.reference || doc.number;
  const title = d.projectTitle || doc.title || "your project";
  const hi = `Dear ${firstName(doc.client?.name)},`;
  const bye = `Kind regards,\n${d.preparedBy || d.representative || brand.preparer}\n${brand.legalName}\n${brand.phone}`;
  const bodies = {
    proposal: `Thank you for the opportunity to work with you. Please find attached our project proposal (${ref}) for ${title}. It covers the system overview, the services involved, the costs and the estimated timeline.\n\nWe would be glad to walk you through it or answer any questions.`,
    contract: `Please find attached the Software Development Agreement (${ref}) for ${title}. Kindly review it, sign it and send us back a signed copy.\n\nOnce the agreement is signed, the ${toNumber(d.depositPercent) || 40}% deposit initiates the project.`,
    technical: `Please find attached the technical document (${ref}) for ${title}. It explains how the system will be built. Kindly review it and let us know if anything does not match what we agreed.`,
    receipt: "Thank you for your payment. Please find your receipt attached.",
  };
  const subjects = {
    proposal: `Project proposal ${ref} — ${title}`,
    contract: `Software Development Agreement ${ref} — ${title}`,
    technical: `Technical document ${ref} — ${title}`,
    receipt: `Payment receipt — ${brand.shortName}`,
  };
  return {
    to: doc.client?.email || "",
    subject: subjects[doc.type] || title,
    message: `${hi}\n\n${bodies[doc.type] || ""}\n\n${bye}`,
  };
};

export const BrandSwitch = ({ value, onChange, label = "Generate as" }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-dim">{label}</span>
    <div className="inline-flex rounded-lg border border-line p-0.5 bg-ink">
      {BRAND_LIST.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onChange(b.key)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === b.key ? "bg-accent text-accentInk" : "text-dim hover:text-text"
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  </div>
);

const btn = "px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50";

// Edits one document. With a `project`, it can also file the PDF in the
// project's R2 folder and email it to the client.
export const DocumentEditor = ({ doc, onChange, docId, onSaved, project, onProjectChange, showToast, onCancel }) => {
  const [busy, setBusy] = useState("");
  const [emailing, setEmailing] = useState(null);
  const Form = FORMS[doc.type];
  const typeLabel = DOC_TYPES.find((t) => t.key === doc.type)?.label || doc.type;

  const run = async (label, fn) => {
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      showToast(e.message || "Something went wrong.", "error");
    } finally {
      setBusy("");
    }
  };

  const save = async () => {
    if (!doc.client?.name?.trim()) throw new Error("Add the client name first.");
    const payload = {
      type: doc.type,
      title: doc.title || doc.data?.projectTitle || "",
      project_id: doc.project_id || project?.id || null,
      client: doc.client,
      data: doc.data,
      total: doc.total,
      status: doc.status,
    };
    const saved = docId ? await updateDocument(docId, payload) : await createDocument(payload);
    onChange({ ...doc, number: saved.number });
    await onSaved?.(saved);
    return saved;
  };

  const deliver = async (email) => {
    const saved = await save();
    const full = { ...doc, number: saved.number };
    const pdf = await toBase64(full);
    const res = await clientsApi.deliver(project.id, { doc_id: saved.id, filename: pdfFilename(full), pdf, email });
    onProjectChange?.(res.data);
    return res;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">
            {docId ? "Edit" : "New"} {typeLabel.toLowerCase()}
          </h2>
          <p className="text-sm text-dim mt-0.5">
            Ref. <span className="text-text font-medium">{doc.data?.reference || doc.number || "assigned on save"}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BrandSwitch value={doc.data?.brand || "methynix"} onChange={(b) => onChange(rebrand(doc, b, project))} label="Brand" />
          <select
            value={doc.status}
            onChange={(e) => onChange({ ...doc, status: e.target.value })}
            className="bg-ink border border-line rounded-lg px-2 py-1.5 text-sm text-text outline-none focus:border-accent"
            aria-label="Status"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <Form value={doc} onChange={onChange} />

      {emailing ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3">
          <p className="text-sm font-medium">Email this {typeLabel.toLowerCase()} to the client</p>
          <input value={emailing.to} onChange={(e) => setEmailing({ ...emailing, to: e.target.value })} placeholder="client@email.com" className="w-full bg-ink border border-line px-3 py-2.5 rounded-lg text-sm outline-none focus:border-accent" />
          <input value={emailing.subject} onChange={(e) => setEmailing({ ...emailing, subject: e.target.value })} className="w-full bg-ink border border-line px-3 py-2.5 rounded-lg text-sm outline-none focus:border-accent" />
          <textarea value={emailing.message} rows={8} onChange={(e) => setEmailing({ ...emailing, message: e.target.value })} className="w-full bg-ink border border-line px-3 py-2.5 rounded-lg text-sm outline-none focus:border-accent resize-y" />
          <p className="text-xs text-faint">The PDF is attached and a copy is saved in the project's R2 folder.</p>
          <div className="flex gap-2">
            <button
              disabled={Boolean(busy)}
              onClick={() =>
                run("email", async () => {
                  if (!emailing.to.trim()) throw new Error("Add the client's email address.");
                  const res = await deliver(emailing);
                  setEmailing(null);
                  showToast(res.stored ? "Sent to the client and filed in R2." : "Sent to the client. (R2 not configured, so no copy was stored.)");
                })
              }
              className={`${btn} bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text`}
            >
              {busy === "email" ? "Sending…" : "Send email"}
            </button>
            <button onClick={() => setEmailing(null)} className={`${btn} text-dim hover:text-text`}>Cancel</button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-5 border-t border-line">
        <button disabled={Boolean(busy)} onClick={() => run("preview", () => previewPdf(doc))} className={`${btn} border border-line text-dim hover:text-text`}>
          {busy === "preview" ? "Building…" : "Preview PDF"}
        </button>
        <button disabled={Boolean(busy)} onClick={() => run("download", () => downloadPdf(doc))} className={`${btn} border border-accent/40 text-accent hover:bg-accent/10`}>
          {busy === "download" ? "Building…" : "Download PDF"}
        </button>
        <button
          disabled={Boolean(busy)}
          onClick={() => run("save", async () => { const s = await save(); showToast(docId ? "Saved." : `Saved as ${s.number}.`); })}
          className={`${btn} bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text`}
        >
          {busy === "save" ? "Saving…" : "Save"}
        </button>
        {project ? (
          <>
            <button
              disabled={Boolean(busy)}
              onClick={() => run("store", async () => { await deliver(null); showToast("Saved to the project folder in R2."); })}
              className={`${btn} border border-line text-dim hover:text-text`}
            >
              {busy === "store" ? "Uploading…" : "Save PDF to R2"}
            </button>
            <button disabled={Boolean(busy)} onClick={() => setEmailing(defaultEmail(doc))} className={`${btn} border border-sand/40 text-sand hover:bg-sand/10`}>
              Email to client…
            </button>
          </>
        ) : null}
        {onCancel ? (
          <button onClick={onCancel} className={`${btn} text-dim hover:text-text ml-auto`}>Close</button>
        ) : null}
      </div>
    </div>
  );
};
