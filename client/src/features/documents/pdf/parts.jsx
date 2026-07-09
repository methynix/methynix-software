import { StyleSheet, View, Text, Image } from "@react-pdf/renderer";
import { COMPANY } from "../company";

export const COLORS = {
  teal: "#14b3c6",
  tealDeep: "#0e7f8f",
  navy: "#12303a",
  ink: "#1a1d22",
  muted: "#6b7280",
  faint: "#9ca3af",
  lightBg: "#eef6f8",
  rowAlt: "#f4f6f7",
  border: "#d8e0e3",
  white: "#ffffff",
};

export const base = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.ink,
    lineHeight: 1.5,
  },
  rule: { height: 3, backgroundColor: COLORS.teal, marginVertical: 14 },
  row: { flexDirection: "row" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: COLORS.muted },
  small: { fontSize: 9 },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 44,
    right: 44,
    textAlign: "center",
    fontSize: 8,
    color: COLORS.faint,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
});

// Standard letterhead: logo left, company block right.
export const Letterhead = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Image src={COMPANY.logo} style={{ width: 72, height: 72, objectFit: "contain" }} />
    <View style={{ marginLeft: 16, flexGrow: 1 }}>
      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 18, color: COLORS.navy }}>
        {COMPANY.name}
      </Text>
      <Text style={{ fontSize: 10, color: COLORS.tealDeep, fontStyle: "italic" }}>
        {COMPANY.tagline}
      </Text>
      <Text style={{ fontSize: 8, color: COLORS.muted, marginTop: 3 }}>
        Registration No. {COMPANY.registration} • {COMPANY.location} • {COMPANY.website}
      </Text>
    </View>
  </View>
);

export const Footer = ({ children }) => (
  <Text style={base.footer} fixed>
    {children || `${COMPANY.shortName} • ${COMPANY.website} • ${COMPANY.email}`}
  </Text>
);
