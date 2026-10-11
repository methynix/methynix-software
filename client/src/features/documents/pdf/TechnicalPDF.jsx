import { Document, Page, View, Text } from "@react-pdf/renderer";
import { getBrand } from "../brands";
import { kit, Cover, H1, H2, P, List, Table, Figure, paddedDate, MUTED } from "./kit";

// A technical document is a list of sections, each a list of blocks:
//   { type: "heading", text }            -> numbered n.k sub-heading
//   { type: "paragraph", text }
//   { type: "bullets" | "numbered", items: [] }
//   { type: "table", caption, columns: [], rows: [[]] }
//   { type: "image", src, caption }
// Section and sub-heading numbers are generated, so reordering never breaks them.

const Block = ({ block, number, figure }) => {
  switch (block.type) {
    case "heading":
      return <H2 n={number}>{block.text}</H2>;
    case "paragraph":
      return block.text ? <P>{block.text}</P> : null;
    case "bullets":
      return <List items={block.items} style="bullet" indent={14} />;
    case "numbered":
      return <List items={block.items} style="number" indent={14} />;
    case "table": {
      const cols = block.columns || [];
      if (!cols.length) return null;
      const widths = block.widths || cols.map(() => 1);
      return (
        <View>
          {block.caption ? (
            <Text style={{ fontSize: 10, marginBottom: 4 }}>
              <Text style={kit.bold}>Table: </Text>
              <Text style={kit.italic}>{block.caption}</Text>
            </Text>
          ) : null}
          <Table
            columns={cols.map((label, i) => ({ label, flex: widths[i] || 1 }))}
            rows={(block.rows || []).filter((r) => r.some((c) => String(c || "").trim()))}
            fontSize={9}
          />
        </View>
      );
    }
    case "image":
      return <Figure src={block.src} caption={block.caption ? `Figure ${figure}: ${block.caption}` : null} />;
    default:
      return null;
  }
};

// Pre-compute numbering so the contents page and the body agree.
const outline = (sections = []) => {
  let figure = 0;
  return sections.map((s, si) => {
    let sub = 0;
    return {
      ...s,
      number: si + 1,
      blocks: (s.blocks || []).map((b) => ({
        block: b,
        number: b.type === "heading" ? `${si + 1}.${++sub}` : null,
        figure: b.type === "image" && b.src ? ++figure : null,
      })),
    };
  });
};

export const TechnicalPDF = ({ doc, assets = {} }) => {
  const d = doc.data || {};
  const brand = getBrand(d.brand);
  const reference = d.reference || doc.number;
  const sections = outline(d.sections);
  const signOff = sections.length + 1;
  const approvals = (d.approvals || []).filter((a) => a.name);
  const versions = (d.versions || []).filter((v) => v.version);

  const header = `${brand.shortName} | Technical Document`;

  return (
    <Document title={`Technical Document ${reference}`} author={brand.legalName}>
      <Page size="A4" style={kit.page}>
        <Cover
          brand={brand}
          logo={assets.logo}
          title="TECHNICAL DOCUMENT (SYSTEM DESIGN)"
          subtitle={d.projectTitle}
          meta={[
            ["PREPARED FOR:", doc.client?.name ? `${doc.client.name} (Client)` : ""],
            ["PREPARED BY:", `${d.preparedBy || brand.preparer}, ${brand.shortName}`],
            ["REFERENCE NO.:", reference],
            ["VERSION:", `${d.version || "1.0"}      STATUS: ${d.docStatus || "Draft for client review"}`],
            ["DATE:", paddedDate(d.date)],
            ["CONFIDENTIAL:", "For internal and client use only"],
          ]}
        />
      </Page>

      <Page size="A4" style={kit.page}>
        <Text fixed style={{ position: "absolute", top: 24, right: 56, fontSize: 8.5, color: "#8a9099" }}>{header}</Text>

        <H1 brand={brand} tone="ink">DOCUMENT CONTROL</H1>
        <Table
          columns={[{ label: "Version", flex: 0.8 }, { label: "Date", flex: 1 }, { label: "Author", flex: 1.4 }, { label: "Changes", flex: 2.4 }]}
          rows={versions.map((v) => [v.version, paddedDate(v.date), v.author, v.changes])}
        />
        <Table
          style={{ marginTop: 10 }}
          columns={[{ label: "Reviewed / Approved By", flex: 1.4 }, { label: "Role", flex: 1.2 }, { label: "Date", flex: 1.2 }]}
          rows={approvals.map((a) => [a.name, a.role, paddedDate(a.date)])}
        />

        <H1 brand={brand} tone="ink">TABLE OF CONTENTS</H1>
        {sections.map((s) => (
          <View key={s.number}>
            <Text style={[kit.bold, { marginTop: 5 }]}>{s.number} {String(s.title || "").toUpperCase()}</Text>
            {s.blocks
              .filter((b) => b.number)
              .map((b) => (
                <Text key={b.number} style={{ paddingLeft: 14, marginTop: 2, fontSize: 10 }}>
                  {b.number} {b.block.text}
                </Text>
              ))}
          </View>
        ))}
        <Text style={[kit.bold, { marginTop: 5 }]}>{signOff} SIGN-OFF</Text>

        {sections.map((s, i) => (
          <View key={s.number} break={i === 0}>
            <H1 brand={brand} tone="ink" n={s.number}>{String(s.title || "").toUpperCase()}</H1>
            {s.blocks.map((b, bi) => (
              <Block key={bi} {...b} />
            ))}
          </View>
        ))}

        <View wrap={false}>
          <H1 brand={brand} tone="ink" n={signOff}>SIGN-OFF</H1>
          <P>
            By signing below, both parties confirm that this technical document reflects the agreed design for
            {d.projectTitle ? ` the ${d.projectTitle}` : " the system"}.
          </P>
          <Table
            columns={[{ label: "Name", flex: 1.4 }, { label: "Role", flex: 1.3 }, { label: "Signature", flex: 1.4 }, { label: "Date", flex: 1 }]}
            rows={[
              [d.preparedBy || brand.preparer, brand.shortName, "", ""],
              [doc.client?.name || "", "Client", "", ""],
            ]}
          />
        </View>

        <Text
          fixed
          style={{ position: "absolute", bottom: 26, left: 0, right: 0, textAlign: "center", fontSize: 9, color: MUTED }}
          render={({ pageNumber }) => `Confidential  |  Page ${pageNumber}`}
        />
      </Page>
    </Document>
  );
};
