import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { COMPANY } from "../company";
import { formatTZS, formatDate, toNumber, amountInWords } from "../format";
import { COLORS, base, Letterhead, Footer } from "./parts";

const METHODS = [
  { key: "cash", label: "Cash" },
  { key: "mobile", label: "Mobile Money" },
  { key: "bank", label: "Bank Transfer" },
  { key: "other", label: "Other" },
];

const Check = ({ on }) => (
  <View
    style={{
      width: 9,
      height: 9,
      borderWidth: 1,
      borderColor: COLORS.navy,
      marginRight: 4,
      backgroundColor: on ? COLORS.navy : COLORS.white,
    }}
  />
);

const Field = ({ label, value }) => (
  <View style={{ marginTop: 12 }}>
    <Text style={[base.bold, { color: COLORS.navy }]}>{label}</Text>
    <Text style={{ marginTop: 2, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 3, minHeight: 14 }}>
      {value || " "}
    </Text>
  </View>
);

export const ReceiptPDF = ({ doc }) => {
  const d = doc.data || {};
  const total = toNumber(d.totalAmount);
  const paid = toNumber(d.amountPaid);
  const balance = d.balanceDue !== undefined && d.balanceDue !== "" ? toNumber(d.balanceDue) : total - paid;
  const words = d.amountInWords || amountInWords(paid || total);

  const TotalRow = ({ label, value, alt }) => (
    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: alt ? COLORS.rowAlt : COLORS.white }}>
      <Text style={[base.bold, { flex: 1, padding: 7 }]}>{label}</Text>
      <Text style={{ width: 40, padding: 7, color: COLORS.muted, textAlign: "right" }}>TZS</Text>
      <Text style={{ width: 90, padding: 7, textAlign: "right" }}>{formatTZS(value)}</Text>
    </View>
  );

  return (
    <Document title={`Receipt ${doc.number}`}>
      <Page size="A4" style={base.page}>
        <Letterhead />
        <View style={base.rule} />

        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1.3, backgroundColor: COLORS.navy, justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text style={{ color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 18 }}>PAYMENT RECEIPT</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.lightBg, justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text><Text style={base.bold}>Receipt No: </Text>{doc.number}</Text>
            <Text><Text style={base.bold}>Date: </Text>{formatDate(d.date)}</Text>
          </View>
        </View>

        <Field label="Received with thanks from:" value={doc.client?.name || d.receivedFrom} />
        <Field label="The sum of (in words):" value={words} />
        <Field label="Being payment for:" value={d.paymentFor} />

        <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
          <Text style={[base.bold, { marginRight: 12 }]}>Payment method:</Text>
          {METHODS.map((m) => (
            <View key={m.key} style={{ flexDirection: "row", alignItems: "center", marginRight: 14 }}>
              <Check on={d.method === m.key} />
              <Text>{m.label}{m.key === "other" && d.method === "other" && d.methodOther ? `: ${d.methodOther}` : ""}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
          <View style={{ width: 250, borderWidth: 1, borderColor: COLORS.teal, borderRadius: 4 }}>
            <TotalRow label="Total Amount" value={total} />
            <TotalRow label="Amount Paid" value={paid} alt />
            <TotalRow label="Balance Due" value={balance} />
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 46 }}>
          <View style={{ width: 210 }}>
            {d.signature ? (
              <Image src={d.signature} style={{ height: 40, objectFit: "contain", marginBottom: 2 }} />
            ) : (
              <View style={{ height: 40 }} />
            )}
            <View style={{ borderTopWidth: 1, borderTopColor: COLORS.muted, paddingTop: 4 }}>
              <Text style={base.small}>{d.receivedByName || COMPANY.operator}</Text>
              <Text style={[base.small, base.muted]}>Received by (Name & Signature)</Text>
            </View>
          </View>
          <View style={{ width: 180, justifyContent: "flex-end" }}>
            <View style={{ borderTopWidth: 1, borderTopColor: COLORS.muted, paddingTop: 4, marginTop: 40 }}>
              <Text style={[base.small, base.muted]}>Company Stamp</Text>
            </View>
          </View>
        </View>

        <Text style={{ textAlign: "center", marginTop: 30, color: COLORS.tealDeep, fontFamily: "Helvetica-Bold" }}>
          Thank you for your business!
        </Text>

        <Footer>{`${COMPANY.shortName} • ${COMPANY.website}`}</Footer>
      </Page>
    </Document>
  );
};
