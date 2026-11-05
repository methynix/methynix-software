import { pdf } from "@react-pdf/renderer";
import { getBrand } from "../brands";
import { BRAND_LOGOS, DEFAULT_SIGNATURE } from "./assets";
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

const logoCache = {};

export const resolveLogo = async (brandKey, customSrc) => {
  const brand = brandKey || "methynix";
  const defaultLogo = getBrand(brand).logo;

  // 1. If no custom logo or if it's the standard brand logo path, use the rock-solid pre-bundled Base64 logo immediately
  if (
    !customSrc ||
    customSrc === defaultLogo ||
    customSrc === "/logo.png" ||
    customSrc === "/kaspa-logo.png" ||
    customSrc === "/kaspa-logo.jpeg" ||
    customSrc === "/methynix.png"
  ) {
    return BRAND_LOGOS[brand] || BRAND_LOGOS.methynix;
  }

  // 2. If it's already a valid base64 data URL
  if (typeof customSrc === "string" && customSrc.startsWith("data:image/")) {
    return customSrc;
  }

  // 3. If it's a Cloudflare Dashboard URL (not public), map directly to pre-bundled logo
  if (typeof customSrc === "string" && customSrc.includes("dash.cloudflare.com")) {
    if (customSrc.toLowerCase().includes("kaspa")) return BRAND_LOGOS.kaspa;
    if (customSrc.toLowerCase().includes("methynix")) return BRAND_LOGOS.methynix;
  }

  // 4. Try network fetch for real external custom logo, but strictly verify it's an image
  if (typeof customSrc === "string") {
    if (customSrc in logoCache) return logoCache[customSrc];
    try {
      const url =
        typeof window !== "undefined" && customSrc.startsWith("/")
          ? `${window.location.origin}${customSrc}`
          : customSrc;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        // Prevent HTML pages (e.g. 404/SPA index.html or Cloudflare login) from corrupting the PDF
        if (blob.type && blob.type.startsWith("image/")) {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          logoCache[customSrc] = dataUrl;
          return dataUrl;
        }
      }
    } catch {
      // Fall back below
    }
  }

  // Pre-bundled, zero-delay base64 data URLs for Methynix and Kaspa
  return BRAND_LOGOS[brand] || BRAND_LOGOS.methynix || null;
};

export const toBlob = async (doc) => {
  const Comp = pickComponent(doc);
  if (!Comp) throw new Error("Unknown document type.");
  const brandKey = doc.data?.brand || "methynix";
  const customLogo = doc.data?.logo || getBrand(brandKey).logo;
  const logo = await resolveLogo(brandKey, customLogo);
  return pdf(<Comp doc={doc} assets={{ logo, signature: DEFAULT_SIGNATURE }} />).toBlob();
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
