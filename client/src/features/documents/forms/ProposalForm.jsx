import { FormSection, ListEditor, RowsEditor, TextField } from "./fields";
import { proposalTotal } from "../defaults";
import { formatTZS, toNumber } from "../format";
import { getBrand } from "../brands";
import { defaultConclusion } from "../pdf/ProposalPDF";

export const ProposalForm = ({ value, onChange }) => {
  const d = value.data;
  const total = proposalTotal(d);
  const days = (d.timeline || []).reduce((s, r) => s + toNumber(r.days), 0);
  const deposit = Math.round((total * (toNumber(d.depositPercent) || 40)) / 100);

  const patch = (partial) => {
    const data = { ...d, ...partial };
    onChange({ ...value, data, total: proposalTotal(data) });
  };
  const patchClient = (partial) => onChange({ ...value, client: { ...value.client, ...partial } });

  return (
    <div className="space-y-6">
      <FormSection title="Cover page">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Project / system title" value={d.projectTitle} onChange={(v) => patch({ projectTitle: v })} placeholder="Examination Management Platform" />
          <TextField label="Prepared for (client)" value={value.client.name} onChange={(v) => patchClient({ name: v })} placeholder="Fasali Mwenzegule" />
          <TextField label="Client email" value={value.client.email} onChange={(v) => patchClient({ email: v })} placeholder="client@email.com" />
          <TextField label="Reference no." value={d.reference} onChange={(v) => patch({ reference: v })} placeholder="NTD-0008" hint="Leave empty to use the saved document number." />
          <TextField label="Date" type="date" value={d.date} onChange={(v) => patch({ date: v })} />
          <TextField label="Prepared by" value={d.preparedBy} onChange={(v) => patch({ preparedBy: v })} />
        </div>
      </FormSection>

      <FormSection title="1. System general overview">
        <TextField label="Overview" multiline rows={5} value={d.overview} onChange={(v) => patch({ overview: v })} placeholder="The proposed system is a…" />
      </FormSection>

      <FormSection title="1.1 System modules">
        <RowsEditor
          rows={d.modules}
          onChange={(modules) => patch({ modules })}
          blank={{ module: "", description: "" }}
          fields={[
            { key: "module", label: "Module", width: "1fr" },
            { key: "description", label: "Description", width: "2fr", multiline: true },
          ]}
        />
      </FormSection>

      <FormSection title="1.2 Key features">
        <ListEditor items={d.features} onChange={(features) => patch({ features })} placeholder="Role-based access for…" />
      </FormSection>

      <FormSection title="2. Third party services and integrations">
        <RowsEditor
          rows={d.services}
          onChange={(services) => patch({ services })}
          blank={{ service: "", purpose: "", provider: "" }}
          fields={[
            { key: "service", label: "Service" },
            { key: "purpose", label: "Purpose" },
            { key: "provider", label: "Provider options" },
          ]}
        />
      </FormSection>

      <FormSection title="3.1 One-time development costs" hint={`Total TZS ${formatTZS(total)} · ${d.depositPercent || 40}% deposit = TZS ${formatTZS(deposit)}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <TextField label="Scope label" value={d.devScopeLabel} onChange={(v) => patch({ devScopeLabel: v })} placeholder="Web only" />
          <TextField label="Deposit %" value={d.depositPercent} onChange={(v) => patch({ depositPercent: v })} />
        </div>
        <RowsEditor
          rows={d.devCosts}
          onChange={(devCosts) => patch({ devCosts })}
          blank={{ component: "", cost: "", note: "" }}
          fields={[
            { key: "component", label: "System component", width: "2fr" },
            { key: "cost", label: "Cost (TZS)", width: "130px", numeric: true },
            { key: "note", label: "Note", width: "150px", placeholder: "(+ provider fees)" },
          ]}
        />
      </FormSection>

      <FormSection title="3.2 Recurring and operational costs" hint="Production costs the client pays to providers. These never count as Methynix revenue.">
        <RowsEditor
          rows={d.recurring}
          onChange={(recurring) => patch({ recurring })}
          blank={{ item: "", cost: "" }}
          fields={[
            { key: "item", label: "Item", width: "2fr" },
            { key: "cost", label: "Cost (text)", width: "1fr", placeholder: "40,000 per year" },
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Total recurring (text)" value={d.recurringTotal} onChange={(v) => patch({ recurringTotal: v })} placeholder="70k per month and 40k yearly" />
          <TextField label="Note" value={d.recurringNote} onChange={(v) => patch({ recurringNote: v })} />
        </div>
      </FormSection>

      <FormSection title="4. Project timeline" hint={days ? `${days} days in total` : "Enter days per phase to get a total."}>
        <RowsEditor
          rows={d.timeline}
          onChange={(timeline) => patch({ timeline })}
          blank={{ phase: "", duration: "", days: "" }}
          fields={[
            { key: "phase", label: "Phase", width: "3fr", multiline: true },
            { key: "duration", label: "Duration", width: "110px", placeholder: "1 WEEK" },
            { key: "days", label: "Days", width: "70px", numeric: true },
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Total (overrides days sum)" value={d.timelineTotal} onChange={(v) => patch({ timelineTotal: v })} placeholder={days ? `${days} days` : ""} />
          <TextField label="Note" value={d.timelineNote} onChange={(v) => patch({ timelineNote: v })} />
        </div>
      </FormSection>

      <FormSection title="5. Terms & conditions">
        <ListEditor items={d.terms} onChange={(terms) => patch({ terms })} multiline />
      </FormSection>

      <FormSection title="6. Conclusion">
        <TextField
          label="Conclusion"
          multiline
          value={d.conclusion}
          onChange={(v) => patch({ conclusion: v })}
          placeholder={defaultConclusion(d, getBrand(d.brand), total)}
          hint="Leave empty to use the standard wording shown."
        />
        <TextField label="Valid for (days)" value={d.validityDays} onChange={(v) => patch({ validityDays: v })} />
      </FormSection>
    </div>
  );
};
