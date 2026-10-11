import { pdf } from "@react-pdf/renderer";
import { getBrand } from "../brands";
import { ReceiptPDF } from "./ReceiptPDF";
import { ContractPDF } from "./ContractPDF";
import { AgreementPDF } from "./AgreementPDF";
import { ProposalPDF } from "./ProposalPDF";
import { TechnicalPDF } from "./TechnicalPDF";

// Invoices are no longer generated. Contracts saved before the agreement
// template have a stage table and use the older Master Service Agreement layout.
const pickComponent = (doc) => {
  if (doc.type === "contract") return doc.data?.template === "agreement-v1" ? AgreementPDF : ContractPDF;
  return { receipt: ReceiptPDF, proposal: ProposalPDF, technical: TechnicalPDF }[doc.type];
};

// react-pdf throws if an image 404s, so check the brand logo first and leave
// it out when it is missing (e.g. before the Kaspa logo is added).
const logoCache = {};
const resolveLogo = async (src) => {
  if (!src) return null;
  if (src in logoCache) return logoCache[src];
  try {
    const res = await fetch(src, { method: "HEAD" });
    const ok = res.ok && (res.headers.get("content-type") || "").startsWith("image/");
    logoCache[src] = ok ? src : null;
  } catch {
    logoCache[src] = null;
  }
  return logoCache[src];
};

export const toBlob = async (doc) => {
  const Comp = pickComponent(doc);
  if (!Comp) throw new Error("Unknown document type.");
  const logo = await resolveLogo(getBrand(doc.data?.brand).logo);
  return pdf(<Comp doc={doc} assets={{ logo }} />).toBlob();
};

export const pdfFilename = (doc) => {
  const label = { proposal: "Proposal", contract: "Agreement", technical: "Technical_Document", receipt: "Receipt", invoice: "Invoice" }[doc.type] || doc.type;
  const title = (doc.data?.projectTitle || doc.client?.name || "").replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");
  return `${[title, doc.data?.reference || doc.number, label].filter(Boolean).join("_")}.pdf`;
};

export const toBase64 = async (doc) => {
  const blob = await toBlob(doc);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the PDF."));
    reader.readAsDataURL(blob);
  });
};

export const downloadPdf = async (doc, filename) => {
  const blob = await toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || pdfFilename(doc);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const previewPdf = async (doc) => {
  // Open the tab synchronously so pop-up blockers allow it, then fill it.
  const win = window.open("", "_blank");
  let blob;
  try {
    blob = await toBlob(doc);
  } catch (err) {
    if (win) win.close();
    throw err;
  }
  const url = URL.createObjectURL(blob);
  if (win) win.location.href = url;
  else window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
