import { FormSection, ListEditor, TextField } from "./fields";
import { SignaturePad } from "../SignaturePad";
import { formatTZS, toNumber } from "../format";

// Software Development Agreement. Older stage-table contracts are converted to
// this layout the first time they are edited.
export const AgreementForm = ({ value, onChange }) => {
  const d = value.data;
  const total = toNumber(d.totalFee);
  const pct = toNumber(d.depositPercent) || 40;
  const deposit = Math.round((total * pct) / 100);

  const patch = (partial) => {
    const data = { ...d, template: "agreement-v1", ...partial };
    onChange({ ...value, data, total: toNumber(data.totalFee) });
  };
  const patchClient = (partial) => onChange({ ...value, client: { ...value.client, ...partial } });

  return (
    <div className="space-y-6">
      <FormSection title="Agreement details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Project / system title" value={d.projectTitle} onChange={(v) => patch({ projectTitle: v })} placeholder="Examination Management Platform" />
          <TextField label="Reference no." value={d.reference} onChange={(v) => patch({ reference: v })} placeholder="CTT-0008" />
          <TextField label="Agreement date" type="date" value={d.date} onChange={(v) => patch({ date: v })} />
          <TextField label="Represented by" value={d.representative} onChange={(v) => patch({ representative: v })} />
        </div>
      </FormSection>

      <FormSection title="The client">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Client name / company" value={value.client.name} onChange={(v) => patchClient({ name: v })} />
          <TextField label="Of (city / address)" value={value.client.address} onChange={(v) => patchClient({ address: v })} placeholder="Dar-es-Salaam" />
          <TextField label="Client email" value={value.client.email} onChange={(v) => patchClient({ email: v })} />
          <TextField label="Client phone" value={value.client.phone} onChange={(v) => patchClient({ phone: v })} />
        </div>
      </FormSection>

      <FormSection title="Proposal reference" hint="Filled from the project's proposal when generated from the pipeline.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Proposal reference" value={d.proposalRef} onChange={(v) => patch({ proposalRef: v })} placeholder="NTD-0008" />
          <TextField label="Proposal date" type="date" value={d.proposalDate} onChange={(v) => patch({ proposalDate: v })} />
        </div>
      </FormSection>

      <FormSection title="1. Definitions — system modules">
        <ListEditor items={d.systemModules || []} onChange={(systemModules) => patch({ systemModules })} placeholder="Admin Panel & User Management" />
      </FormSection>

      <FormSection title="2. Scope — special principle (optional)" hint="Becomes clause 2.2. Leave empty to omit it.">
        <TextField label="Principle" multiline value={d.scopePrinciple} onChange={(v) => patch({ scopePrinciple: v })} placeholder="online examinations … shall link, in real time, to the relevant linked parent account; …" />
      </FormSection>

      <FormSection title="3. Timeline">
        <TextField label="Estimated duration" value={d.durationText} onChange={(v) => patch({ durationText: v })} placeholder="approximately nine (9) weeks" />
        <ListEditor items={d.phases || []} onChange={(phases) => patch({ phases })} placeholder="Phase 0 - Foundation" />
      </FormSection>

      <FormSection title="4. Fees" hint={`Deposit ${pct}% = TZS ${formatTZS(deposit)} · balance TZS ${formatTZS(total - deposit)}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField label="Development fee (TZS)" value={d.totalFee} onChange={(v) => patch({ totalFee: v })} placeholder="1400000" />
          <TextField label="Deposit %" value={d.depositPercent} onChange={(v) => patch({ depositPercent: v })} />
          <TextField label="Recurring costs estimate" value={d.recurringEstimate} onChange={(v) => patch({ recurringEstimate: v })} placeholder="TZS 880,000 per year" />
        </div>
      </FormSection>

      <FormSection title="Terms">
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Warranty (months)" value={d.warrantyMonths} onChange={(v) => patch({ warrantyMonths: v })} />
          <TextField label="Breach cure (days)" value={d.cureDays} onChange={(v) => patch({ cureDays: v })} />
          <TextField label="Dispute talks (days)" value={d.disputeDays} onChange={(v) => patch({ disputeDays: v })} />
        </div>
      </FormSection>

      <FormSection title="Your signature">
        <TextField label="Signing date" type="date" value={d.providerSignDate} onChange={(v) => patch({ providerSignDate: v })} />
        <SignaturePad label="Signature" value={d.providerSignature} onChange={(sig) => patch({ providerSignature: sig })} />
        <p className="text-xs text-faint">The client signs after you send it. Upload their signed copy on the project page.</p>
      </FormSection>
    </div>
  );
};
