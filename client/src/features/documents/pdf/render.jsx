import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import { ReceiptPDF } from "./ReceiptPDF";
import { ContractPDF } from "./ContractPDF";

export const PDF_COMPONENTS = {
  invoice: InvoicePDF,
  receipt: ReceiptPDF,
  contract: ContractPDF,
};

const toBlob = async (doc) => {
  const Comp = PDF_COMPONENTS[doc.type];
  if (!Comp) throw new Error("Unknown document type.");
  return pdf(<Comp doc={doc} />).toBlob();
};

export const downloadPdf = async (doc, filename) => {
  const blob = await toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${doc.type}-${doc.number || "draft"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const previewPdf = async (doc) => {
  const blob = await toBlob(doc);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
