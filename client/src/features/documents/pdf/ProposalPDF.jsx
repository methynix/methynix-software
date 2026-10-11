import { Document, Page, View, Text } from "@react-pdf/renderer";
import { getBrand } from "../brands";
import { formatTZS, toNumber } from "../format";
import { proposalTotal } from "../defaults";
import { kit, Cover, H1, H2, P, List, Table, PageNumber, shortDate } from "./kit";

const daysTotal = (timeline = []) => timeline.reduce((s, r) => s + toNumber(r.days), 0);

export const defaultConclusion = (d, brand, total) =>
  `This proposal outlines a complete, scalable and cost-effective solution for ${
    d.projectTitle || "the proposed system"
  }. With a one-time development cost of TZS ${formatTZS(total)} and calculated yearly operational costs, ${
    brand.legalName
  } is positioned to deliver a professional, modern and maintainable system tailored to the client's needs.`;

export const ProposalPDF = ({ doc, assets = {} }) => {
  const d = doc.data || {};
  const brand = getBrand(d.brand);
  const total = proposalTotal(d);
  const deposit = toNumber(d.depositPercent) || 40;
  const timeline = d.timeline || [];
  const totalDays = daysTotal(timeline);
  const recurring = (d.recurring || []).filter((r) => r.item);
  const reference = d.reference || doc.number;

  let section = 0;
  const next = () => ++section;

  return (
    <Document title={`Proposal ${reference}`} author={brand.legalName}>
      {/* Cover */}
      <Page size="A4" style={kit.page}>
        <Cover
          brand={brand}
          logo={assets.logo}
          title="PROJECT PROPOSAL (SYSTEM OVERVIEW)"
          subtitle={d.projectTitle}
          note="This document is not technical and prepared for the client and includes the general system flow and costs breakdown, from development to production costs"
          meta={[
            ["PREPARED BY:", d.preparedBy || brand.preparer],
            ["DATE:", shortDate(d.date)],
            ["REFERENCE NO.", reference],
            ["PREPARED FOR:", doc.client?.name ? `${doc.client.name.toUpperCase()} (Client)` : ""],
          ]}
        />
        <PageNumber />
      </Page>

      <Page size="A4" style={kit.page}>
        {(() => {
          const n = next();
          return (
            <View>
              <H1 brand={brand} n={n}>SYSTEM GENERAL OVERVIEW</H1>
              <P>{d.overview}</P>

              {(d.modules || []).some((m) => m.module) ? (
                <>
                  <H2 n={`${n}.1`}>SYSTEM MODULES</H2>
                  <Table
                    columns={[{ label: "S/N", flex: 0.45 }, { label: "MODULE", flex: 1.6 }, { label: "DESCRIPTION", flex: 3.6 }]}
                    rows={d.modules.filter((m) => m.module).map((m, i) => [String(i + 1), m.module, m.description])}
                  />
                </>
              ) : null}

              {(d.features || []).some(Boolean) ? (
                <>
                  <H2 n={`${n}.2`}>KEY FEATURES</H2>
                  <List items={d.features} style="roman" />
                </>
              ) : null}
            </View>
          );
        })()}

        {(d.services || []).some((s) => s.service) ? (
          <View>
            <H1 brand={brand} n={next()}>THIRD PARTY SERVICES AND INTEGRATIONS</H1>
            <P>To ensure the platform is functional, scalable and secure, the following third-party services and integrations are required:</P>
            <Table
              columns={[{ label: "SERVICE", flex: 1.4 }, { label: "PURPOSE", flex: 1.6 }, { label: "PROVIDER OPTIONS", flex: 1.6 }]}
              rows={d.services.filter((s) => s.service).map((s) => [s.service, s.purpose, s.provider])}
            />
          </View>
        ) : null}

        {(() => {
          const n = next();
          return (
            <View>
              <H1 brand={brand} n={n}>FINANCIAL BREAKDOWN</H1>
              <P>Costs are split into two parts: one-time build investments and ongoing yearly operational expenses.</P>

              <H2 n={`${n}.1`}>ONE-TIME DEVELOPMENT COSTS{d.devScopeLabel ? ` (${d.devScopeLabel.toUpperCase()})` : ""}</H2>
              <Table
                columns={[{ label: "S/N", flex: 0.45 }, { label: "SYSTEM COMPONENT", flex: 3.6 }, { label: "COST (TZS)", flex: 1.6 }]}
                rows={(d.devCosts || [])
                  .filter((r) => r.component)
                  .map((r, i) => [String(i + 1), r.component, `${formatTZS(r.cost)}${r.note ? ` ${r.note}` : ""}`])}
                footer={["", "TOTAL (Excluding Recurring Fees)", formatTZS(total)]}
              />
              <Text style={[kit.italic, { marginBottom: 10 }]}>
                A {deposit}% upfront deposit is required to initiate the project, due to resource allocation and initial setup requirements.
              </Text>

              {recurring.length ? (
                <>
                  <H2 n={`${n}.2`}>RECURRING AND OPERATIONAL COSTS (YEARLY)</H2>
                  <Table
                    columns={[{ label: "S/N", flex: 0.45 }, { label: "ITEM", flex: 3.2 }, { label: "COST (TZS/YEAR)", flex: 1.8 }]}
                    rows={recurring.map((r, i) => [String(i + 1), r.item, r.cost])}
                    footer={d.recurringTotal ? ["", "TOTAL RECURRING (YEARLY, estimated)", d.recurringTotal] : undefined}
                  />
                  {d.recurringNote ? <P>NB: {d.recurringNote}</P> : null}
                </>
              ) : null}
            </View>
          );
        })()}

        {timeline.some((t) => t.phase) ? (
          <View>
            <H1 brand={brand} n={next()}>PROJECT TIMELINE (ESTIMATED)</H1>
            <Table
              columns={[{ label: "PHASE", flex: 4 }, { label: "DURATION", flex: 1.4 }]}
              rows={timeline.filter((t) => t.phase).map((t) => [t.phase, t.duration || (t.days ? `${t.days} days` : "")])}
              footer={["TOTAL", d.timelineTotal || (totalDays ? `${totalDays} days` : "")]}
            />
            {d.timelineNote ? <P>NB: {d.timelineNote}</P> : null}
          </View>
        ) : null}

        {(d.terms || []).some(Boolean) ? (
          <View>
            <H1 brand={brand} n={next()}>TERMS & CONDITIONS</H1>
            <List items={d.terms} style="roman" />
          </View>
        ) : null}

        <View wrap={false}>
          <H1 brand={brand} n={next()}>CONCLUSION</H1>
          <P>{d.conclusion || defaultConclusion(d, brand, total)}</P>
          <P>We look forward to partnering with you on this project.</P>
          <Text style={[kit.bold, { marginTop: 14 }]}>Prepared by:</Text>
          <Text style={{ marginTop: 4 }}>{d.preparedBy || brand.preparer}</Text>
        </View>

        <View style={{ marginTop: 26 }} wrap={false}>
          <Text>{brand.legalName}</Text>
          <Text>{[brand.email, brand.phone].join("  |  ")}</Text>
          <Text style={[kit.italic, { marginTop: 10 }]}>
            This proposal is valid for {toNumber(d.validityDays) || 30} days from the date of issuance.
          </Text>
        </View>
        <PageNumber />
      </Page>
    </Document>
  );
};
