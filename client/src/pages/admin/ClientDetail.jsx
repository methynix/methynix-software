import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { clientsApi, paymentsApi, fileToBase64 } from "../../api/adminApi";
import { useUI } from "../../context/UIContext";
import { SkeletonClientDetail, SkeletonEditor } from "../../components/ui/Skeleton";
import { PageHeader, Card, Button, Dialog, Field, Select, Pill, Empty, money, fmtDate, toInputDate, dueLabel, dueTone } from "./ui";
import { STAGES, stage, FILE_CATEGORIES } from "./constants";
import { LeadForm, leadPayload } from "./LeadForm";
import { BRAND_LIST, getBrand } from "../../features/documents/brands";
import { defaultWorking } from "../../features/documents/defaults";
import { amountInWords } from "../../features/documents/format";

// The editor pulls in the PDF renderer; load it only when a document is opened.
const DocumentEditor = lazy(() => import("../../features/documents/DocumentEditor").then((m) => ({ default: m.DocumentEditor })));
const loadRender = () => import("../../features/documents/pdf/render");

const FLOW = STAGES.filter((s) => !["on_hold", "lost"].includes(s.key));
const DEPOSIT_RATE = 0.4;
const MAX_UPLOAD = 25 * 1024 * 1024;

const DOCS = [
  { type: "proposal", label: "Proposal", field: "proposal_doc_id", needs: null },
  { type: "contract", label: "Contract (agreement)", field: "contract_doc_id", needs: "proposal" },
  { type: "technical", label: "Technical document", field: "technical_doc_id", needs: "proposal" },
];

const Stepper = ({ status }) => {
  const idx = FLOW.findIndex((s) => s.key === status);
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {FLOW.map((s, i) => (
        <div key={s.key} className="flex-1 min-w-[64px]">
          <div className={`h-1.5 rounded-full ${i <= idx ? "bg-accent" : "bg-raised"}`} />
          <p className={`text-[10px] mt-1.5 truncate ${i === idx ? "text-text font-medium" : "text-faint"}`}>{s.label}</p>
        </div>
      ))}
    </div>
  );
};

const emptyPayment = (amount = "") => ({ amount, kind: "development", date: toInputDate(new Date()), method: "Mobile money", reference: "", note: "" });

export const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [project, setProject] = useState(null);
  const [editing, setEditing] = useState(null); // lead form
  const [doc, setDoc] = useState(null); // { working, docId }
  const [payment, setPayment] = useState(null);
  const [upload, setUpload] = useState(null);
  const [busy, setBusy] = useState("");
  const editorRef = useRef(null);
  const [scrollTick, setScrollTick] = useState(0);

  const load = useCallback(() => clientsApi.get(id).then(setProject).catch((e) => showToast(e.message, "error")), [id, showToast]);
  useEffect(() => { load(); }, [load]);
  // Bring the editor into view whenever a document is opened.
  useEffect(() => {
    if (scrollTick) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollTick]);

  if (!project) return <SkeletonClientDetail />;

  const s = stage(project.status);
  const deposit = Math.round(project.quote * DEPOSIT_RATE);
  const balance = Math.max(project.quote - project.paid, 0);
  const devPayments = project.payments.filter((p) => p.kind === "development");
  const docById = (docId) => project.documents.find((d) => d.id === docId);
  const proposal = docById(project.proposal_doc_id);

  const setStatus = async (status) => {
    if (status === "completed" && !window.confirm(`Mark completed? ${project.client.email ? `${project.client.email} will get a completion email.` : "There is no client email, so no email will go out."}`)) return;
    try {
      const r = await clientsApi.update(project.id, { status });
      await load();
      if (r.emailed) showToast("Completed. The client has been emailed.");
      else if (r.emailError) showToast(r.emailError, "error");
      else showToast(`Moved to ${stage(status).label}.`);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const openEditor = (working, docId = null) => {
    setDoc({ working, docId });
    setScrollTick((t) => t + 1);
  };

  const generate = (type, brand) => {
    if (type !== "proposal" && !proposal) {
      showToast("Create the proposal first; the contract and technical document are built from it.", "error");
      return;
    }
    openEditor(defaultWorking(type, { brand, project, proposal }));
  };

  const onDocSaved = async (saved) => {
    setDoc((d) => ({ ...d, docId: saved.id }));
    const meta = DOCS.find((x) => x.type === saved.type);
    const patch = {};
    if (meta && project[meta.field] !== saved.id) patch[meta.field] = saved.id;
    if (saved.data?.brand && saved.data.brand !== project.brand) patch.brand = saved.data.brand;
    // The proposal sets the price until a contract exists; the contract is final.
    if ((saved.type === "contract" || (saved.type === "proposal" && !project.contract_doc_id)) && saved.total) patch.quote = saved.total;
    if (Object.keys(patch).length) await clientsApi.update(project.id, patch);
    await load();
  };

  const saveLead = async () => {
    try {
      await clientsApi.update(project.id, leadPayload(editing));
      setEditing(null);
      await load();
      showToast("Project updated.");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${project.name}? Its payments stay in Finance and its files stay in R2.`)) return;
    await clientsApi.remove(project.id);
    navigate("/admin/dashboard/clients");
  };

  const recordPayment = async () => {
    setBusy("payment");
    try {
      const saved = await paymentsApi.create({ ...payment, project_id: project.id, amount: Number(String(payment.amount).replace(/[,\s]/g, "")) });
      setPayment(null);
      await load();
      showToast(saved.kind === "development" ? "Payment recorded and split into savings, Mastercard and expenses." : "Pass-through payment recorded.");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  const removePayment = async (p) => {
    if (!window.confirm(`Delete the ${money(p.amount)} payment?`)) return;
    await paymentsApi.remove(p.id);
    load();
  };

  const makeReceipt = (p) => {
    if (p.receipt_doc_id && docById(p.receipt_doc_id)) return openEditor(docById(p.receipt_doc_id), p.receipt_doc_id);
    const w = defaultWorking("receipt", { brand: project.brand, project });
    const paidBefore = devPayments.filter((x) => new Date(x.date) <= new Date(p.date) && x.id !== p.id).reduce((sum, x) => sum + x.amount, 0);
    w.data = {
      ...w.data,
      date: toInputDate(p.date),
      paymentFor: `${project.name} — ${p.is_deposit ? `${DEPOSIT_RATE * 100}% upfront deposit` : p.kind === "production" ? "production costs" : "development payment"}`,
      totalAmount: String(project.quote || p.amount),
      amountPaid: String(p.amount),
      balanceDue: String(Math.max((project.quote || p.amount) - paidBefore - p.amount, 0)),
      amountInWords: amountInWords(p.amount),
      method: /bank/i.test(p.method) ? "bank" : /cash/i.test(p.method) ? "cash" : "mobile",
    };
    w.total = project.quote || p.amount;
    w.paymentId = p.id;
    openEditor(w);
  };

  const openFile = async (f) => {
    try {
      const url = await clientsApi.fileUrl(project.id, f.id);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const removeFile = async (f) => {
    if (!window.confirm(`Delete ${f.name} from R2?`)) return;
    try {
      await clientsApi.removeFile(project.id, f.id);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const doUpload = async () => {
    if (!upload.file) return showToast("Choose a file.", "error");
    if (upload.file.size > MAX_UPLOAD) return showToast("Files must be under 25 MB.", "error");
    setBusy("upload");
    try {
      await clientsApi.uploadFile(project.id, {
        filename: upload.file.name,
        content_type: upload.file.type,
        category: upload.category,
        data: await fileToBase64(upload.file),
      });
      setUpload(null);
      await load();
      showToast(upload.category === "signed_contract" ? "Signed contract stored. Project moved to Signed." : "File uploaded to R2.");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  const generateButtons = (type) => (
    <div className="flex flex-wrap gap-1.5">
      {BRAND_LIST.map((b) => (
        <Button key={b.key} variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={() => generate(type, b.key)}>
          Generate as {b.label}
        </Button>
      ))}
    </div>
  );

  // Contextual next-step actions for the current stage.
  const nextActions = {
    lead: <Button onClick={() => setStatus("contacted")}>Mark contacted</Button>,
    contacted: (
      <>
        <Button variant="ghost" onClick={() => setStatus("discovery")}>Move to discovery</Button>
        {!proposal ? generateButtons("proposal") : null}
      </>
    ),
    discovery: proposal ? <Button onClick={() => openEditor(proposal, proposal.id)}>Open proposal to send</Button> : generateButtons("proposal"),
    proposal_sent: (
      <>
        <Button onClick={() => setStatus("accepted")}>Client accepted</Button>
        <Button variant="danger" onClick={() => setStatus("lost")}>Lost</Button>
      </>
    ),
    accepted: project.contract_doc_id ? <Button onClick={() => openEditor(docById(project.contract_doc_id), project.contract_doc_id)}>Open contract to send</Button> : generateButtons("contract"),
    contract_sent: <Button onClick={() => setUpload({ file: null, category: "signed_contract" })}>Upload signed contract</Button>,
    signed: <Button onClick={() => setPayment({ ...emptyPayment(String(deposit || "")), note: "40% upfront deposit" })}>Record {DEPOSIT_RATE * 100}% deposit{deposit ? ` (${money(deposit)})` : ""}</Button>,
    deposit_paid: (
      <>
        {!project.technical_doc_id ? generateButtons("technical") : null}
        <Button onClick={() => setStatus("in_progress")}>Start the work</Button>
      </>
    ),
    in_progress: <Button onClick={() => setStatus("delivered")}>Mark delivered</Button>,
    delivered: (
      <>
        {balance ? <Button variant="ghost" onClick={() => setPayment({ ...emptyPayment(String(balance)), note: "Final balance" })}>Record balance ({money(balance)})</Button> : null}
        <Button onClick={() => setStatus("completed")}>Mark completed & email client</Button>
      </>
    ),
    on_hold: <Button onClick={() => setStatus(project.status_history.filter((h) => h.status !== "on_hold").slice(-1)[0]?.status || "lead")}>Resume</Button>,
  }[project.status];

  const docFiles = project.files.filter((f) => f.name !== ".keep");

  return (
    <>
      <Link to="/admin/dashboard/clients" className="text-sm text-dim hover:text-text">← Clients</Link>
      <div className="mt-3" />
      <PageHeader
        title={project.name}
        subtitle={`${project.client.company || project.client.name || "No client"}${project.client.email ? ` · ${project.client.email}` : ""} · Ref ${String(project.ref_no || "").padStart(4, "0")} · ${getBrand(project.brand).legalName}`}
        actions={
          <>
            <Pill tone={s.tone}>{s.label}</Pill>
            <select
              value={project.status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-surface border border-line rounded-lg px-2.5 py-2 text-sm outline-none focus:border-accent"
              aria-label="Stage"
            >
              {STAGES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
            <Button variant="ghost" onClick={() => setEditing({ ...project, quote: String(project.quote || ""), start_date: toInputDate(project.start_date), deadline: toInputDate(project.deadline) })}>Edit</Button>
          </>
        }
      />

      <Card className="mb-4">
        <Stepper status={project.status} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-faint">Next step</p>
            <p className="text-sm mt-0.5">{s.next}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">{nextActions}</div>
        </div>
        {project.deadline ? (
          <p className={`text-xs mt-4 ${dueTone(project.deadline)}`}>Deadline {fmtDate(project.deadline)} · {dueLabel(project.deadline)}</p>
        ) : null}
      </Card>

      <div ref={editorRef}>
        {doc ? (
          <div className="rounded-2xl border border-accent/30 bg-surface p-5 md:p-7 mb-4">
            <Suspense fallback={<SkeletonEditor />}>
              <DocumentEditor
                doc={doc.working}
                docId={doc.docId}
                onChange={(w) => setDoc((d) => ({ ...d, working: w }))}
                project={project}
                onProjectChange={() => load()}
                showToast={showToast}
                onSaved={async (saved) => {
                  if (doc.working.paymentId && !doc.docId) await paymentsApi.update(doc.working.paymentId, { receipt_doc_id: saved.id });
                  await onDocSaved(saved);
                }}
                onCancel={() => setDoc(null)}
              />
            </Suspense>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card title="Documents" padded={false}>
            <ul className="divide-y divide-line">
              {DOCS.map((meta) => {
                const d = docById(project[meta.field]);
                return (
                  <li key={meta.type} className="px-5 py-4 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-faint mt-0.5">
                        {d ? `${d.data?.reference || d.number} · ${getBrand(d.data?.brand).label} · ${d.status}` : meta.needs && !proposal ? "Needs the proposal first" : "Not created yet"}
                      </p>
                    </div>
                    {d ? (
                      <div className="flex gap-2">
                        <Button variant="ghost" className="!py-1.5 text-xs" onClick={() => openEditor(d, d.id)}>Open</Button>
                        <Button variant="ghost" className="!py-1.5 text-xs" onClick={() => loadRender().then((m) => m.downloadPdf(d)).catch((e) => showToast(e.message, "error"))}>PDF</Button>
                      </div>
                    ) : meta.needs && !proposal ? null : (
                      generateButtons(meta.type)
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card
            title="Files in R2"
            actions={<Button variant="ghost" className="!py-1.5 text-xs" onClick={() => setUpload({ file: null, category: "technical_doc" })}>Upload file</Button>}
            padded={false}
          >
            {!project.storageReady ? (
              <p className="px-5 pt-4 text-xs text-sand">R2 is not configured on the server yet, so files cannot be stored. See SETUP.md.</p>
            ) : null}
            {docFiles.length === 0 ? (
              <p className="p-5 text-sm text-dim">No files yet. Sent documents and uploads land in <span className="font-mono text-xs">{project.storage_folder}/</span></p>
            ) : (
              <ul className="divide-y divide-line">
                {docFiles.map((f) => (
                  <li key={f.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{f.name}</p>
                      <p className="text-xs text-faint">
                        {FILE_CATEGORIES.find((c) => c.value === f.category)?.label || f.category} · {(f.size / 1024).toFixed(0)} KB · {fmtDate(f.uploaded_at)}
                      </p>
                    </div>
                    <button onClick={() => openFile(f)} className="text-xs text-accent">Open</button>
                    <button onClick={() => removeFile(f)} className="text-xs text-red-300">Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Payments"
            actions={<Button variant="ghost" className="!py-1.5 text-xs" onClick={() => setPayment(emptyPayment(devPayments.length ? String(balance || "") : String(deposit || "")))}>Record payment</Button>}
            padded={false}
          >
            {project.payments.length === 0 ? (
              <p className="p-5 text-sm text-dim">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {project.payments.map((p) => (
                  <li key={p.id} className="px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium tabular-nums">
                        {money(p.amount)} {p.is_deposit ? <Pill tone="sand">deposit</Pill> : null} {p.kind === "production" ? <Pill>pass-through</Pill> : null}
                      </p>
                      <p className="text-xs text-faint">
                        {fmtDate(p.date)} · {p.method || "—"}
                        {p.kind === "development" ? ` · savings ${money(p.allocation.savings)}, mastercard ${money(p.allocation.mastercard)}, expenses ${money(p.allocation.expenses)}` : ""}
                      </p>
                    </div>
                    <button onClick={() => makeReceipt(p)} className="text-xs text-accent">{p.receipt_doc_id ? "Receipt" : "Make receipt"}</button>
                    <button onClick={() => removePayment(p)} className="text-xs text-red-300">Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Money">
            <dl className="space-y-2.5 text-sm">
              {[
                ["Development price", money(project.quote)],
                [`Deposit due (${DEPOSIT_RATE * 100}%)`, money(deposit)],
                ["Paid so far", money(project.paid)],
                ["Balance", money(balance)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-dim">{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            {project.production_costs.length ? (
              <div className="mt-4 pt-4 border-t border-line">
                <p className="text-xs text-faint mb-2">Production costs (client pays providers)</p>
                {project.production_costs.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs text-dim">
                    <span>{c.item}</span>
                    <span className="tabular-nums">{money(c.amount)} {c.cycle === "monthly" ? "/mo" : c.cycle === "yearly" ? "/yr" : ""}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          <Card title="Client">
            <dl className="space-y-2 text-sm">
              {[
                ["Name", project.client.name],
                ["Company", project.client.company],
                ["Email", project.client.email],
                ["Phone", project.client.phone],
                ["Address", project.client.address],
                ["Source", project.source],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-dim">{k}</dt>
                    <dd className="text-right break-all">{v}</dd>
                  </div>
                ))}
            </dl>
            {project.description ? <p className="text-sm text-dim mt-4 pt-4 border-t border-line whitespace-pre-wrap">{project.description}</p> : null}
            {project.notes ? <p className="text-sm text-sand/90 mt-4 pt-4 border-t border-line whitespace-pre-wrap">{project.notes}</p> : null}
          </Card>

          <Card title="History">
            <ol className="space-y-2">
              {[...project.status_history].reverse().map((h, i) => (
                <li key={i} className="flex justify-between text-xs">
                  <span>{stage(h.status).label}</span>
                  <span className="text-faint">{fmtDate(h.at)}</span>
                </li>
              ))}
            </ol>
            <Button variant="danger" className="mt-5 w-full text-xs" onClick={remove}>Delete project</Button>
          </Card>
        </div>
      </div>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit project" wide footer={<><Button variant="subtle" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveLead}>Save</Button></>}>
        {editing ? <LeadForm value={editing} onChange={setEditing} /> : null}
      </Dialog>

      <Dialog
        open={Boolean(payment)}
        onClose={() => setPayment(null)}
        title="Record payment"
        footer={<><Button variant="subtle" onClick={() => setPayment(null)}>Cancel</Button><Button onClick={recordPayment} disabled={busy === "payment"}>{busy === "payment" ? "Saving…" : "Record"}</Button></>}
      >
        {payment ? (
          <div className="space-y-3">
            <Select
              label="What is it for?"
              value={payment.kind}
              onChange={(e) => setPayment({ ...payment, kind: e.target.value })}
              options={[
                { value: "development", label: "Development (Methynix revenue — gets split 50/10/40)" },
                { value: "production", label: "Production costs (pass-through to providers, not revenue)" },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (TZS)" inputMode="numeric" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
              <Field label="Date" type="date" value={payment.date} onChange={(e) => setPayment({ ...payment, date: e.target.value })} />
              <Field label="Method" value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })} />
              <Field label="Reference" value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} placeholder="Transaction ID" />
            </div>
            <Field label="Note" value={payment.note} onChange={(e) => setPayment({ ...payment, note: e.target.value })} />
            {payment.kind === "development" && Number(payment.amount) ? (
              <p className="text-xs text-faint">
                Split: savings {money(Number(payment.amount) * 0.5)} · mastercard {money(Number(payment.amount) * 0.1)} · expenses {money(Number(payment.amount) * 0.4)}
              </p>
            ) : null}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(upload)}
        onClose={() => setUpload(null)}
        title="Upload to R2"
        footer={<><Button variant="subtle" onClick={() => setUpload(null)}>Cancel</Button><Button onClick={doUpload} disabled={busy === "upload"}>{busy === "upload" ? "Uploading…" : "Upload"}</Button></>}
      >
        {upload ? (
          <div className="space-y-3">
            <Select label="Kind of file" value={upload.category} onChange={(e) => setUpload({ ...upload, category: e.target.value })} options={FILE_CATEGORIES} />
            <input type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} className="block w-full text-sm text-dim file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-raised file:text-text" />
            <p className="text-xs text-faint">
              Saved in <span className="font-mono">{project.storage_folder}/</span>. Uploading a signed contract moves the project to Signed.
            </p>
          </div>
        ) : null}
      </Dialog>

      {project.documents.length === 0 && project.payments.length === 0 && docFiles.length === 0 ? (
        <div className="mt-4"><Empty>Tip: generate the proposal as Methynix or Kaspa above. It pre-fills from this project.</Empty></div>
      ) : null}
    </>
  );
};
