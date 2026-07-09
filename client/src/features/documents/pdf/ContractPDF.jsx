import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { COMPANY } from "../company";
import { formatTZS, toNumber } from "../format";
import { COLORS, base, Letterhead, Footer } from "./parts";

const Section = ({ n, title, children }) => (
  <View style={{ marginTop: 16 }} wrap={false}>
    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, color: COLORS.tealDeep, marginBottom: 5 }}>
      <Text style={{ color: COLORS.teal }}>{n} </Text>
      {title}
    </Text>
    {children}
  </View>
);

const P = ({ children, style }) => (
  <Text style={[{ marginBottom: 6, textAlign: "justify" }, style]}>{children}</Text>
);

const cell = (flex, extra = {}) => ({ flex, paddingVertical: 6, paddingHorizontal: 6, ...extra });

export const ContractPDF = ({ doc }) => {
  const d = doc.data || {};
  const total = toNumber(doc.total) || toNumber(d.totalCost);
  const stages = Array.isArray(d.stages) ? d.stages : [];

  return (
    <Document title={`Agreement ${doc.number}`}>
      <Page size="A4" style={base.page}>
        <Letterhead />
        <View style={base.rule} />

        <Text style={{ textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 20, color: COLORS.ink, marginTop: 4 }}>
          MASTER SERVICE AGREEMENT
        </Text>
        <Text style={{ textAlign: "center", fontSize: 9, color: COLORS.muted, fontStyle: "italic", marginTop: 4 }}>
          This Agreement sets out the terms and conditions governing the professional engagement between the parties
          identified below.
        </Text>

        <P style={{ marginTop: 14 }}>
          1. This Agreement is entered into on the {d.day || "____"} day of {d.month || "________"}, {d.year || "20__"}.
        </P>

        {/* Parties */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.rowAlt, borderRadius: 6, padding: 12 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: COLORS.tealDeep, marginBottom: 4 }}>SERVICE PROVIDER</Text>
            <Text>{COMPANY.shortName}</Text>
            <Text>A registered business name operated by {d.providerOperator || COMPANY.operator}</Text>
            <Text>Registration No.: {COMPANY.registration}</Text>
            <Text style={base.muted}>Hereinafter referred to as "Service Provider"</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.lightBg, borderRadius: 6, padding: 12 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: COLORS.tealDeep, marginBottom: 4 }}>CLIENT</Text>
            <Text>{doc.client?.name || "________________"}</Text>
            {doc.client?.address ? <Text>{doc.client.address}</Text> : null}
            {doc.client?.phone ? <Text>{doc.client.phone}</Text> : null}
            {doc.client?.email ? <Text>{doc.client.email}</Text> : null}
            <Text style={base.muted}>Hereinafter referred to as "Client"</Text>
          </View>
        </View>

        <Section n="1" title="SCOPE OF WORK">
          <P>
            The Service Provider agrees to deliver the services described below, which shall form the basis of this
            engagement. All deliverables, timelines, and specifications shall be confirmed in writing between the parties
            prior to commencement of work.
          </P>
          <P>
            <Text style={base.bold}>Project description: </Text>
            {d.projectDescription || "________________________________________________"}
          </P>
          <P>
            Specific deliverables and milestone deadlines shall be agreed upon between the Service Provider and Client in
            writing via email or WhatsApp, and shall be treated as binding addenda to this Agreement.
          </P>
        </Section>

        <Section n="2" title="PAYMENT TERMS">
          <P>
            <Text style={base.bold}>Development and production Costs: </Text>
            <Text style={{ color: COLORS.tealDeep, fontFamily: "Helvetica-Bold" }}>TZS {formatTZS(total)}</Text>
          </P>
          <P>
            Payment shall be made in the stages set out below. Each stage payment becomes due upon the corresponding
            milestone being reached and accepted by the Client. The Service Provider reserves the right to pause work if a
            payment falls overdue by more than seven (7) calendar days.
          </P>

          <View style={{ marginTop: 6 }} wrap={false}>
            <View style={{ flexDirection: "row", backgroundColor: COLORS.navy }}>
              <Text style={[cell(1), base.bold, { color: COLORS.white }]}>Stage</Text>
              <Text style={[cell(2.4), base.bold, { color: COLORS.white }]}>Description</Text>
              <Text style={[cell(0.9), base.bold, { color: COLORS.white, textAlign: "center" }]}>%</Text>
              <Text style={[cell(1.3), base.bold, { color: COLORS.white, textAlign: "right" }]}>Amount (TZS)</Text>
              <Text style={[cell(2), base.bold, { color: COLORS.white }]}>Notes</Text>
            </View>
            {stages.map((s, i) => (
              <View key={i} style={{ flexDirection: "row", backgroundColor: i % 2 ? COLORS.rowAlt : COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                <Text style={[cell(1), base.bold]}>{s.stage}</Text>
                <Text style={cell(2.4)}>{s.description}</Text>
                <Text style={[cell(0.9), { textAlign: "center" }]}>{s.percent}%</Text>
                <Text style={[cell(1.3), { textAlign: "right" }]}>{formatTZS(s.amount)}</Text>
                <Text style={[cell(2), base.small]}>{s.note}</Text>
              </View>
            ))}
            <View style={{ flexDirection: "row", backgroundColor: COLORS.lightBg }}>
              <Text style={[cell(1), base.bold]}>TOTAL</Text>
              <Text style={[cell(2.4), base.bold]}>Grand Total (All Stages Combined)</Text>
              <Text style={[cell(0.9), base.bold, { textAlign: "center" }]}>100%</Text>
              <Text style={[cell(1.3), base.bold, { textAlign: "right" }]}>{formatTZS(total)}</Text>
              <Text style={cell(2)} />
            </View>
          </View>

          <P style={{ marginTop: 8 }}>
            <Text style={base.bold}>Payment Method: </Text>{d.paymentMethod || "Mobile Money / Bank Transfer"}
          </P>
          <P>
            All payments shall be made directly to {COMPANY.shortName} through the method agreed upon at the time of
            project commencement. Receipts shall be issued upon confirmation of each payment.
          </P>
        </Section>

        <Section n="3" title="OWNERSHIP & INTELLECTUAL PROPERTY">
          <P>
            Upon receipt of full and final payment as stipulated in this Agreement, all ownership rights to the agreed
            deliverables shall transfer to the Client.
          </P>
          <P>
            Notwithstanding the above, the Service Provider retains the non-exclusive right to display, reference, and use
            the completed work in its portfolio, website, social media channels, and promotional materials for the purpose
            of demonstrating professional capability. This right may be waived if the Client requests confidentiality in
            writing, and both parties agree to such an arrangement prior to project commencement.
          </P>
          <P>
            Any third-party tools, libraries, or assets incorporated into the deliverables remain subject to their
            respective licences. The Service Provider shall disclose the use of any such components upon request.
          </P>
        </Section>

        <Section n="4" title="CONFIDENTIALITY">
          <P>
            Both parties agree to treat as strictly confidential all proprietary information, business data, technical
            materials, and any other sensitive information disclosed by either party in connection with this Agreement.
            This obligation shall apply during the term of this Agreement and for a period of two (2) years following its
            conclusion or termination.
          </P>
          <P>
            Neither party shall disclose confidential information to any third party without the prior written consent of
            the disclosing party, except where required by law or by order of a competent authority.
          </P>
        </Section>

        <Section n="5" title="REVISIONS & CHANGE REQUESTS">
          <P>
            This Agreement covers the scope of work as initially described and agreed. Any revisions, additions, or changes
            to the project scope requested by the Client after work has commenced shall be subject to a written change
            request and may result in adjustments to the project fee and timeline.
          </P>
          <P>
            Minor revisions that do not materially alter the scope of work may be accommodated at the Service Provider's
            discretion without additional charge. Significant changes shall be quoted and agreed upon separately.
          </P>
        </Section>

        <Section n="6" title="LIMITATION OF LIABILITY">
          <P>
            The Service Provider's total liability to the Client under or in connection with this Agreement shall not
            exceed the total project fee paid by the Client at the time the claim arises.
          </P>
          <P>
            The Service Provider shall not be liable for any indirect, incidental, consequential, or punitive losses or
            damages arising from the use of, or inability to use, the deliverables, including but not limited to loss of
            revenue, loss of data, or reputational harm.
          </P>
        </Section>

        <Section n="7" title="TERMINATION">
          <P>
            Either party may terminate this Agreement by providing seven (7) calendar days' written notice to the other
            party.
          </P>
          <P>
            In the event that the Client elects to terminate this Agreement after work has commenced, the Service Provider
            shall be entitled to retain all payments received to date as compensation for work completed. Any outstanding
            deliverables for unpaid stages shall not be transferred to the Client.
          </P>
          <P>
            In the event that the Service Provider terminates the Agreement without cause, all completed deliverables shall
            be handed over to the Client and any payments received for work not yet delivered shall be refunded on a
            pro-rata basis.
          </P>
        </Section>

        <Section n="8" title="GOVERNING LAW & DISPUTE RESOLUTION">
          <P>
            This Agreement shall be governed by and construed in accordance with the laws of the United Republic of
            Tanzania. Any dispute arising out of or in connection with this Agreement shall first be referred to good-faith
            negotiation between the parties. If the dispute cannot be resolved within fourteen (14) days of written notice,
            the parties may seek resolution through the appropriate legal channels under Tanzanian law.
          </P>
        </Section>

        <Section n="9" title="ENTIRE AGREEMENT">
          <P>
            This Agreement, together with any project briefs, scope documents, or written correspondence referenced herein,
            constitutes the entire agreement between the parties with respect to its subject matter. It supersedes all
            prior discussions, representations, and understandings, whether oral or written.
          </P>
          <P>
            No amendment or modification of this Agreement shall be valid unless made in writing and signed by both parties.
          </P>
        </Section>

        {/* Signatures */}
        <View style={{ marginTop: 24 }} wrap={false}>
          <Text style={{ textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 14, marginBottom: 4 }}>
            ACCEPTANCE & SIGNATURES
          </Text>
          <Text style={{ textAlign: "center", fontSize: 9, color: COLORS.muted, fontStyle: "italic", marginBottom: 14 }}>
            By signing below, both parties confirm that they have read, understood, and agreed to all terms set out in this
            Agreement.
          </Text>

          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={base.bold}>For Methynix Software (Service Provider)</Text>
              <View style={{ marginTop: 10 }}>
                <Text style={base.small}><Text style={base.bold}>Name: </Text>{d.providerSignName || COMPANY.operator}</Text>
                <Text style={[base.small, { marginTop: 6 }]}><Text style={base.bold}>Title: </Text>{d.providerSignTitle || "Founder"}</Text>
                <View style={{ marginTop: 8, height: 42 }}>
                  {d.providerSignature ? <Image src={d.providerSignature} style={{ height: 40, objectFit: "contain" }} /> : null}
                </View>
                <Text style={[base.small, { borderTopWidth: 1, borderTopColor: COLORS.muted, paddingTop: 3 }]}>Signature</Text>
                <Text style={[base.small, { marginTop: 8 }]}><Text style={base.bold}>Date: </Text>_______________</Text>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: COLORS.rowAlt, borderRadius: 6, padding: 12 }}>
              <Text style={base.bold}>For Client</Text>
              <View style={{ marginTop: 10 }}>
                <Text style={base.small}><Text style={base.bold}>Name: </Text>{doc.client?.name || "________________"}</Text>
                <Text style={[base.small, { marginTop: 6 }]}><Text style={base.bold}>Title / Position: </Text>_______________</Text>
                <View style={{ marginTop: 8, height: 42, borderBottomWidth: 1, borderBottomColor: COLORS.muted }} />
                <Text style={[base.small, { paddingTop: 3 }]}>Signature</Text>
                <Text style={[base.small, { marginTop: 8 }]}><Text style={base.bold}>Date: </Text>_______________</Text>
              </View>
            </View>
          </View>
        </View>

        <Footer>{`${COMPANY.shortName} • Registration No. ${COMPANY.registration} • ${COMPANY.website} • ${COMPANY.email}`}</Footer>
      </Page>
    </Document>
  );
};

// Default four-stage schedule, amounts derived from the total.
export const defaultStages = (total) => {
  const n = toNumber(total);
  return [
    { stage: "Stage 0", description: "Project Agreement / Upfront Payment", percent: 20, amount: Math.round(n * 0.2), note: "Due before work begins" },
    { stage: "Stage 1", description: "Initial Demonstration / Prototype", percent: 30, amount: Math.round(n * 0.3), note: "Due upon prototype approval" },
    { stage: "Stage 2", description: "Mid-Work Delivery / Testing Phase", percent: 30, amount: Math.round(n * 0.3), note: "Due upon testing sign-off" },
    { stage: "Stage 3", description: "Final Delivery, Hosting & Deployment", percent: 20, amount: Math.round(n * 0.2), note: "Due upon final handover" },
  ];
};
