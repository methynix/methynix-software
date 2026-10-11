import { StyleSheet, View, Text, Image, Font } from "@react-pdf/renderer";

// Keep words whole; react-pdf otherwise hyphenates inside narrow table cells.
Font.registerHyphenationCallback((word) => [word]);

// Building blocks for the brand-aware documents (proposal, agreement,
// technical document). Layout follows the studio's existing Word templates:
// centred cover page, numbered red/teal section headings, grey-header tables.

export const INK = "#1a1d22";
export const MUTED = "#555b66";
export const BORDER = "#c9cdd3";
export const HEAD_BG = "#e6e6e6";

export const kit = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 60,
    paddingHorizontal: 56,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.45,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  italic: { fontFamily: "Helvetica-Oblique" },
  p: { marginBottom: 7, textAlign: "justify" },
  cell: { paddingVertical: 5, paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: BORDER },
});

export const Cover = ({ brand, logo, title, subtitle, note, meta = [], children }) => (
  <View style={{ alignItems: "center", textAlign: "center", marginTop: 40 }}>
    {logo ? <Image src={logo} style={{ width: 150, height: 100, objectFit: "contain", marginBottom: 26 }} /> : null}
    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 20 }}>{brand.name}</Text>
    <Text style={{ fontSize: 11, marginTop: 6 }}>{brand.legalName}</Text>
    <Text style={[kit.italic, { fontSize: 11, marginTop: 3 }]}>‘{brand.tagline}’</Text>
    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 17, color: brand.colors.primary, marginTop: 24 }}>{title}</Text>
    {subtitle ? <Text style={[kit.italic, { fontSize: 12, marginTop: 6 }]}>{subtitle}</Text> : null}
    {note ? <Text style={{ fontSize: 10.5, marginTop: 14, maxWidth: 440 }}>{note}</Text> : null}
    <View style={{ marginTop: 20 }}>
      {meta
        .filter(([, v]) => v)
        .map(([label, value]) => (
          <Text key={label} style={{ fontSize: 11, marginTop: 7 }}>
            <Text style={kit.bold}>{label} </Text>
            {value}
          </Text>
        ))}
    </View>
    {children}
    <Text style={{ fontSize: 9.5, marginTop: 22 }}>
      {[brand.website, brand.email, brand.phone].filter(Boolean).join("  |  ")}
    </Text>
    <Text style={{ fontSize: 9.5, marginTop: 4 }}>{brand.address}</Text>
  </View>
);

export const PageNumber = ({ prefix = "" }) => (
  <Text
    fixed
    style={{ position: "absolute", bottom: 26, left: 0, right: 0, textAlign: "center", fontSize: 9, color: MUTED }}
    render={({ pageNumber }) => `${prefix}${pageNumber}`}
  />
);

export const RunningHeader = ({ text }) => (
  <Text
    fixed
    style={{ position: "absolute", top: 24, right: 56, fontSize: 8.5, color: "#8a9099" }}
    render={({ pageNumber }) => (pageNumber > 1 ? text : "")}
  />
);

export const H1 = ({ brand, n, children, tone = "primary" }) => (
  <Text
    minPresenceAhead={60}
    style={{
      fontFamily: "Helvetica-Bold",
      fontSize: 15,
      color: tone === "primary" ? brand.colors.primary : INK,
      marginTop: 18,
      marginBottom: 8,
    }}
  >
    {n ? `${n}  ` : ""}
    {children}
  </Text>
);

export const H2 = ({ n, children }) => (
  <Text minPresenceAhead={40} style={{ fontFamily: "Helvetica-Bold", fontSize: 12, marginTop: 12, marginBottom: 6 }}>
    {n ? `${n}  ` : ""}
    {children}
  </Text>
);

export const P = ({ children, style }) => <Text style={[kit.p, style]}>{children}</Text>;

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"];

// style: "roman" (i.), "number" (1.), "bullet" (•)
export const List = ({ items = [], style = "bullet", indent = 18 }) => (
  <View style={{ marginBottom: 6 }}>
    {items
      .filter((t) => String(t || "").trim())
      .map((t, i) => {
        const mark = style === "roman" ? `${ROMAN[i] || i + 1}.` : style === "number" ? `${i + 1}.` : "•";
        return (
          <View key={i} style={{ flexDirection: "row", marginBottom: 3, paddingLeft: indent }} wrap={false}>
            <Text style={{ width: style === "bullet" ? 12 : 22 }}>{mark}</Text>
            <Text style={{ flex: 1 }}>{t}</Text>
          </View>
        );
      })}
  </View>
);

// columns: [{ label, flex, align, bold }]; rows: array of arrays of strings.
// footer: optional array rendered as a shaded total row.
export const Table = ({ columns, rows = [], footer, fontSize = 9.5, style }) => (
  <View style={[{ borderWidth: 1, borderColor: BORDER, borderRightWidth: 0, marginBottom: 8, fontSize }, style]}>
    <View style={{ flexDirection: "row", backgroundColor: HEAD_BG, borderBottomWidth: 1, borderBottomColor: BORDER }} fixed={false}>
      {columns.map((c, i) => (
        <Text key={i} style={[kit.cell, kit.bold, { flex: c.flex || 1, textAlign: c.align || "left" }]}>
          {c.label}
        </Text>
      ))}
    </View>
    {rows.map((r, ri) => (
      <View key={ri} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER }} wrap={false}>
        {columns.map((c, ci) => (
          <Text key={ci} style={[kit.cell, { flex: c.flex || 1, textAlign: c.align || "left" }, c.bold ? kit.bold : null]}>
            {r[ci] ?? ""}
          </Text>
        ))}
      </View>
    ))}
    {footer ? (
      <View style={{ flexDirection: "row", backgroundColor: HEAD_BG }} wrap={false}>
        {columns.map((c, ci) => (
          <Text key={ci} style={[kit.cell, kit.bold, { flex: c.flex || 1, textAlign: c.align || "left" }]}>
            {footer[ci] ?? ""}
          </Text>
        ))}
      </View>
    ) : null}
  </View>
);

export const Figure = ({ src, caption, height = 300 }) =>
  src ? (
    <View style={{ alignItems: "center", marginVertical: 8 }} wrap={false}>
      <Image src={src} style={{ maxHeight: height, maxWidth: "100%", objectFit: "contain" }} />
      {caption ? <Text style={[kit.italic, { fontSize: 9.5, marginTop: 5 }]}>{caption}</Text> : null}
    </View>
  ) : null;

// "2026-09-15" -> "15/9/2026", the style used on the studio's documents.
export const shortDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${Number(d)}/${Number(m)}/${y}`;
};

export const paddedDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};
