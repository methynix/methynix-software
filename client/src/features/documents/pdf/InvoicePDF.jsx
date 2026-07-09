import { Document, Page, View, Text } from "@react-pdf/renderer";
import { COMPANY } from "../company";
import { formatTZS, formatDate, toNumber } from "../format";
import { COLORS, base, Letterhead, Footer } from "./parts";

const cell = (flex, extra = {}) => ({ flex, paddingVertical: 7, paddingHorizontal: 8, ...extra });

export const InvoicePDF = ({ doc }) => {
  const d = doc.data || {};
  const items = Array.isArray(d.items) ? d.items : [];
  const lineTotal = (it) => toNumber(it.quantity) * toNumber(it.unitPrice);
  const total = toNumber(doc.total) || items.reduce((s, it) => s + lineTotal(it), 0);

  return (
    <Document title={`Invoice ${doc.number}`}>
      <Page size="A4" style={base.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexGrow: 1 }}>
            <Letterhead />
          </View>
          <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 26, color: COLORS.teal }}>INVOICE</Text>
            <Text style={{ fontSize: 9, color: COLORS.navy, fontFamily: "Helvetica-Bold" }}>
              {COMPANY.name} COMPANY
            </Text>
          </View>
        </View>

        <View style={base.rule} />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.rowAlt, borderRadius: 6, padding: 12 }}>
            <Text><Text style={base.bold}>From: </Text>{COMPANY.shortName}</Text>
            <Text><Text style={base.bold}>Email: </Text>{COMPANY.email}</Text>
            <Text><Text style={base.bold}>Phone: </Text>{COMPANY.phone}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.lightBg, borderRadius: 6, padding: 12 }}>
            <Text><Text style={base.bold}>Invoice No: </Text>{doc.number}</Text>
            <Text><Text style={base.bold}>Date: </Text>{formatDate(d.date)}</Text>
            <Text><Text style={base.bold}>Due Date: </Text>{formatDate(d.dueDate) || "—"}</Text>
          </View>
        </View>

        <Text style={{ fontFamily: "Helvetica-Bold", color: COLORS.tealDeep, marginTop: 18, marginBottom: 6 }}>
          BILL TO
        </Text>
        <View style={{ borderBottomWidth: 2, borderBottomColor: COLORS.teal, marginBottom: 8 }} />
        <View style={{ backgroundColor: COLORS.rowAlt, borderRadius: 6, padding: 12 }}>
          <Text><Text style={base.bold}>Client Name: </Text>{doc.client?.name || "—"}</Text>
          <Text><Text style={base.bold}>Client Email: </Text>{doc.client?.email || "—"}</Text>
          <Text><Text style={base.bold}>Client Phone: </Text>{doc.client?.phone || "—"}</Text>
        </View>

        <Text style={{ fontFamily: "Helvetica-Bold", color: COLORS.tealDeep, marginTop: 18, marginBottom: 6 }}>
          PROJECT DESCRIPTION
        </Text>

        {/* Table header */}
        <View style={{ flexDirection: "row", backgroundColor: COLORS.navy }}>
          <Text style={[cell(3), base.bold, { color: COLORS.white }]}>Service</Text>
          <Text style={[cell(1), base.bold, { color: COLORS.white, textAlign: "center" }]}>Quantity</Text>
          <Text style={[cell(1.4), base.bold, { color: COLORS.white, textAlign: "right" }]}>Unit Price (TZS)</Text>
          <Text style={[cell(1.4), base.bold, { color: COLORS.white, textAlign: "right" }]}>Total (TZS)</Text>
        </View>

        {items.length === 0 ? (
          <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
            <Text style={[cell(1), base.muted]}>No line items.</Text>
          </View>
        ) : (
          items.map((it, i) => {
            const filled = it.service || it.quantity || it.unitPrice;
            return (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  backgroundColor: i % 2 ? COLORS.rowAlt : COLORS.white,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text style={cell(3)}>{it.service || "—"}</Text>
                <Text style={[cell(1), { textAlign: "center" }]}>{filled && it.quantity ? it.quantity : "-"}</Text>
                <Text style={[cell(1.4), { textAlign: "right" }]}>{it.unitPrice ? formatTZS(it.unitPrice) : "-"}</Text>
                <Text style={[cell(1.4), { textAlign: "right" }]}>{lineTotal(it) ? formatTZS(lineTotal(it)) : "-"}</Text>
              </View>
            );
          })
        )}

        {/* Total row */}
        <View style={{ flexDirection: "row", marginTop: 2 }}>
          <View style={[cell(3), { backgroundColor: COLORS.white }]} />
          <Text style={[cell(2.4), base.bold, { backgroundColor: COLORS.teal, color: COLORS.white, textAlign: "right" }]}>
            TOTAL PAYMENT
          </Text>
          <Text style={[cell(1.4), base.bold, { backgroundColor: COLORS.navy, color: COLORS.white, textAlign: "right" }]}>
            {formatTZS(total)}/=
          </Text>
        </View>

        <View style={{ marginTop: 22, backgroundColor: COLORS.lightBg, borderRadius: 6, padding: 12 }}>
          <Text style={{ fontFamily: "Helvetica-Bold", color: COLORS.navy, marginBottom: 4 }}>PAYMENT DETAILS</Text>
          <Text><Text style={base.bold}>Mobile Money: </Text>{d.paymentMobile || COMPANY.paymentMobile}</Text>
          {d.notes ? <Text style={{ marginTop: 4 }}>{d.notes}</Text> : null}
        </View>

        <Text style={{ textAlign: "center", marginTop: 22, color: COLORS.tealDeep, fontFamily: "Helvetica-BoldOblique", fontSize: 12 }}>
          Thank you for choosing Methynix!
        </Text>

        <Footer />
      </Page>
    </Document>
  );
};
