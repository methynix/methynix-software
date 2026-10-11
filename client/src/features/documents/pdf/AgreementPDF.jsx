import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { getBrand } from "../brands";
import { formatTZS, toNumber, amountInWords } from "../format";
import { kit, PageNumber, shortDate } from "./kit";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six", "twenty-seven",
  "twenty-eight", "twenty-nine", "thirty"];

// 14 -> "fourteen (14)"
const counted = (n) => {
  const v = toNumber(n);
  return `${NUMBER_WORDS[v] || v} (${v})`;
};

// 1400000 -> "TZS 1,400,000 (Tanzanian Shillings One Million Four Hundred Thousand only)"
const money = (n) =>
  `TZS ${formatTZS(n)} (Tanzanian Shillings ${amountInWords(n).replace(/ Shillings Only$/, "")} only)`;

const Heading = ({ brand, n, children }) => (
  <Text minPresenceAhead={50} style={{ fontFamily: "Helvetica-Bold", fontSize: 12.5, color: brand.colors.primary, marginTop: 14, marginBottom: 6 }}>
    {n}. {children}
  </Text>
);

const Clause = ({ n, children }) => (
  <Text style={[kit.p, { paddingLeft: 22 }]}>
    <Text style={kit.bold}>{n}  </Text>
    {children}
  </Text>
);

const B = ({ children }) => <Text style={kit.bold}>{children}</Text>;

export const AgreementPDF = ({ doc, assets = {} }) => {
  const d = doc.data || {};
  const brand = getBrand(d.brand);
  const alias = brand.partyAlias;
  const reference = d.reference || doc.number;
  const total = toNumber(d.totalFee) || toNumber(doc.total);
  const depositPct = toNumber(d.depositPercent) || 40;
  const deposit = Math.round((total * depositPct) / 100);
  const balance = total - deposit;
  const dt = d.date ? new Date(`${d.date}T00:00:00`) : new Date();
  const clientName = doc.client?.name || "________________";
  const modules = (d.systemModules || []).filter(Boolean);
  const phases = (d.phases || []).filter(Boolean);
  const proposalLabel = `Reference No. ${d.proposalRef || "________"}, dated ${shortDate(d.proposalDate) || "________"}`;

  let n = 0;
  const sec = () => ++n;

  return (
    <Document title={`Agreement ${reference}`} author={brand.legalName}>
      <Page size="A4" style={kit.page}>
        <View style={{ alignItems: "center", textAlign: "center" }}>
          {assets.logo ? <Image src={assets.logo} style={{ width: 110, height: 72, objectFit: "contain", marginBottom: 12 }} /> : null}
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 15 }}>{brand.name}</Text>
          <Text style={{ fontSize: 10, marginTop: 3 }}>{brand.legalName}</Text>
          <Text style={[kit.italic, { fontSize: 10, marginTop: 2 }]}>‘{brand.tagline}’</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 19, color: brand.colors.primary, marginTop: 18 }}>
            SOFTWARE DEVELOPMENT AGREEMENT
          </Text>
          {d.projectTitle ? <Text style={[kit.italic, { fontSize: 12, marginTop: 6 }]}>{d.projectTitle}</Text> : null}
          <Text style={{ fontSize: 10, marginTop: 4 }}>Reference No. {reference}</Text>
          <Text style={{ fontSize: 10, marginTop: 2 }}>Dated: {shortDate(d.date)}</Text>
        </View>

        <P style={{ marginTop: 16 }}>
          This Software Development Agreement (“Agreement”) is made and entered into on this {ordinal(dt.getDate())} day of{" "}
          {MONTHS[dt.getMonth()]}, {dt.getFullYear()} (the “Effective Date”), by and between:
        </P>
        <P>
          <B>(1)  {brand.legalName.toUpperCase()}</B>, {brand.entity}, and represented herein by{" "}
          {d.representative || brand.preparer} (hereinafter referred to as the “Developer” or “{alias}”);
        </P>
        <P><B>AND</B></P>
        <P>
          <B>(2)  {clientName.toUpperCase()}</B>
          {doc.client?.address ? `, of ${doc.client.address}` : ""} (hereinafter referred to as the “Client”).
        </P>
        <P>
          {alias} and the Client are hereinafter individually referred to as a “Party” and collectively as the “Parties”.
        </P>
        <P>
          <B>WHEREAS</B> the Developer submitted to the Client a written proposal, {proposalLabel} (the “Proposal”), for the
          design, development and delivery of {d.projectTitle ? `the ${d.projectTitle}` : "the system"} (the “System”) as
          more particularly described therein; and
        </P>
        <P>
          <B>WHEREAS</B> the Client has reviewed and accepted the Proposal and wishes to engage the Developer to design,
          build and deliver the System on the terms and conditions set out in this Agreement,
        </P>
        <Text style={[kit.bold, { marginBottom: 4 }]}>NOW THEREFORE, the Parties agree as follows:</Text>

        {(() => {
          const s = sec();
          return (
            <View>
              <Heading brand={brand} n={s}>DEFINITIONS</Heading>
              <Clause n={`${s}.1`}>
                “System” means {d.projectTitle ? `the ${d.projectTitle}` : "the system"} described in the Proposal
                {modules.length ? `, including the ${modules.slice(0, -1).join(", ")}${modules.length > 1 ? ", and " : ""}${modules[modules.length - 1]} modules` : ""}.
              </Clause>
              <Clause n={`${s}.2`}>
                “Proposal” means the document titled “Project Proposal (System Overview)”, {proposalLabel}, which is
                incorporated into this Agreement by reference.
              </Clause>
              <Clause n={`${s}.3`}>
                “Deliverables” means all software, source code, documentation and other materials produced by the Developer
                for the Client under this Agreement.
              </Clause>
            </View>
          );
        })()}

        {(() => {
          const s = sec();
          let c = 0;
          return (
            <View>
              <Heading brand={brand} n={s}>SCOPE OF WORK</Heading>
              <Clause n={`${s}.${++c}`}>
                The Developer shall design, develop, test and deliver the System substantially in accordance with the
                modules, features and functionality set out in the Proposal.
              </Clause>
              {d.scopePrinciple ? (
                <Clause n={`${s}.${++c}`}>
                  Without limiting clause {s}.1, the Parties confirm the following functional principle governing the
                  System: {d.scopePrinciple}
                </Clause>
              ) : null}
              <Clause n={`${s}.${++c}`}>
                Any change to the scope described in the Proposal must be agreed in writing by both Parties and may result in
                an adjustment to the fees and/or timeline set out in this Agreement.
              </Clause>
            </View>
          );
        })()}

        {(() => {
          const s = sec();
          return (
            <View>
              <Heading brand={brand} n={s}>PROJECT TIMELINE</Heading>
              <Clause n={`${s}.1`}>
                The System shall be developed
                {phases.length ? ` in ${counted(phases.length)} phases` : ""}, estimated to take {d.durationText || "the period set out in the Proposal"} in
                total from the Effective Date{phases.length ? `, as follows: ${phases.join("; ")}` : ""}.
              </Clause>
              <Clause n={`${s}.2`}>
                Timelines are estimates only. Delays caused by the Client's failure to provide timely feedback, content, or
                access credentials shall extend the timeline accordingly and shall not constitute a breach by the Developer.
              </Clause>
            </View>
          );
        })()}

        {(() => {
          const s = sec();
          return (
            <View>
              <Heading brand={brand} n={s}>FEES AND PAYMENT TERMS</Heading>
              <Clause n={`${s}.1`}>
                The total one-time development fee for the System is {money(total)}, exclusive of recurring/operational costs.
              </Clause>
              <Clause n={`${s}.2`}>
                Payment shall be made as follows: (a) {NUMBER_WORDS[depositPct] || depositPct} percent ({depositPct}%) of the
                total fee, being TZS {formatTZS(deposit)}, payable as a non-refundable deposit upon signing of this Agreement
                to initiate the project; and (b) the remaining {NUMBER_WORDS[100 - depositPct] || 100 - depositPct} percent (
                {100 - depositPct}%), being TZS {formatTZS(balance)}, payable upon final delivery and acceptance of the System.
              </Clause>
              <Clause n={`${s}.3`}>
                Recurring and operational costs - including hosting, object storage, payment-gateway transaction fees, and
                optional maintenance - are separate from the fees in clause {s}.1
                {d.recurringEstimate ? `, are estimated at ${d.recurringEstimate}` : ""}, and are payable directly to the
                relevant third-party service providers or under a separate maintenance arrangement as described in clause 6.
              </Clause>
              <Clause n={`${s}.4`}>All amounts stated in this Agreement are in Tanzanian Shillings (TZS).</Clause>
            </View>
          );
        })()}

        <Heading brand={brand} n={sec()}>OWNERSHIP AND INTELLECTUAL PROPERTY</Heading>
        <Clause n={`${n}.1`}>
          Full source code and all associated assets and Deliverables shall be transferred to, and become the property of,
          the Client only upon receipt by the Developer of the final payment in full under clause 4.2(b).
        </Clause>
        <Clause n={`${n}.2`}>
          Until final payment is received in full, all Deliverables and associated intellectual property rights remain the
          sole property of the Developer.
        </Clause>

        <Heading brand={brand} n={sec()}>WARRANTY AND MAINTENANCE</Heading>
        <Clause n={`${n}.1`}>
          The Developer warrants the System against defects and shall provide free bug-fixing support for{" "}
          {counted(d.warrantyMonths || 3)} months from the date the System goes live.
        </Clause>
        <Clause n={`${n}.2`}>
          Maintenance and support beyond the warranty period is optional and may be arranged under a separate maintenance
          contract, renewable yearly, at a variable price to be agreed between the Parties.
        </Clause>

        <Heading brand={brand} n={sec()}>CLIENT RESPONSIBILITIES</Heading>
        <Clause n={`${n}.1`}>
          The Client shall provide timely feedback, required content and branding materials, and any access credentials
          needed for third-party integrations (e.g. payment gateway, hosting), and shall review and approve Deliverables
          within a reasonable time at each project phase.
        </Clause>

        <Heading brand={brand} n={sec()}>CONFIDENTIALITY</Heading>
        <Clause n={`${n}.1`}>
          Each Party shall keep confidential any proprietary or sensitive information disclosed by the other Party in
          connection with this Agreement and shall not disclose such information to any third party without the prior
          written consent of the disclosing Party, except as required by law.
        </Clause>

        <Heading brand={brand} n={sec()}>TERMINATION</Heading>
        <Clause n={`${n}.1`}>
          Either Party may terminate this Agreement upon material breach by the other Party that remains uncured for{" "}
          {counted(d.cureDays || 14)} days after written notice of such breach.
        </Clause>
        <Clause n={`${n}.2`}>
          Upon termination, the Client shall pay the Developer for all work completed up to the date of termination on a
          pro-rata basis. Any portion of the deposit paid under clause 4.2(a) that relates to work not yet performed shall be
          refunded to the Client, less any costs already reasonably incurred by the Developer.
        </Clause>

        <Heading brand={brand} n={sec()}>LIMITATION OF LIABILITY</Heading>
        <Clause n={`${n}.1`}>
          The Developer's total liability under this Agreement shall not exceed the total fees actually paid by the Client
          under clause 4. Neither Party shall be liable to the other for indirect, incidental, or consequential damages
          arising from this Agreement.
        </Clause>

        <Heading brand={brand} n={sec()}>GOVERNING LAW AND DISPUTE RESOLUTION</Heading>
        <Clause n={`${n}.1`}>
          This Agreement shall be governed by and construed in accordance with the laws of the United Republic of Tanzania.
        </Clause>
        <Clause n={`${n}.2`}>
          Any dispute arising out of or relating to this Agreement shall first be resolved through good-faith negotiation
          between the Parties. If not resolved within {counted(d.disputeDays || 30)} days, either Party may refer the
          dispute to mediation or to the courts of Tanzania of competent jurisdiction.
        </Clause>

        <Heading brand={brand} n={sec()}>ENTIRE AGREEMENT</Heading>
        <Clause n={`${n}.1`}>
          This Agreement, together with the Proposal (Reference No. {d.proposalRef || "________"}), constitutes the entire
          agreement between the Parties relating to its subject matter and supersedes all prior discussions, negotiations, or
          understandings, whether written or oral. Any amendment to this Agreement must be made in writing and signed by
          both Parties.
        </Clause>

        <View wrap={false} style={{ marginTop: 22 }}>
          <Text style={[kit.bold, { marginBottom: 14 }]}>
            IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date(s) set out below.
          </Text>
          <Text style={[kit.bold, { color: brand.colors.primary, marginBottom: 8 }]}>For and on behalf of {brand.legalName}:</Text>
          <Text><B>Name: </B>{d.representative || brand.preparer}</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 8, height: 44 }}>
            <Text style={kit.bold}>Signature: </Text>
            {d.providerSignature ? (
              <Image src={d.providerSignature} style={{ height: 40, width: 140, objectFit: "contain" }} />
            ) : (
              <Text>________________________</Text>
            )}
          </View>
          <Text style={{ marginTop: 6 }}><B>Date: </B>{shortDate(d.providerSignDate) || "______________"}</Text>

          <Text style={[kit.bold, { color: brand.colors.primary, marginTop: 24, marginBottom: 8 }]}>The Client:</Text>
          <Text><B>Name: </B>{clientName}</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 8, height: 44 }}>
            <Text style={kit.bold}>Signature: </Text>
            <Text>________________________</Text>
          </View>
          <Text style={{ marginTop: 6 }}><B>Date: </B>______________</Text>
        </View>

        <PageNumber />
      </Page>
    </Document>
  );
};

const P = ({ children, style }) => <Text style={[kit.p, style]}>{children}</Text>;
