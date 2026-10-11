import { BRANDS } from "./brands";

// Company details used on the letterhead of receipts and older documents.
// Brand-aware documents read from brands.js instead.
export const COMPANY = {
  ...BRANDS.methynix,
  shortName: BRANDS.methynix.legalName,
  location: "Dodoma, Tanzania",
};

export const DOC_TYPES = [
  { key: "proposal", label: "Proposal", blurb: "Project proposal (system overview) and costs." },
  { key: "contract", label: "Contract", blurb: "Software development agreement." },
  { key: "technical", label: "Technical doc", blurb: "System design document for the build." },
  { key: "receipt", label: "Receipt", blurb: "Confirm a payment received." },
];

export const STATUS_OPTIONS = ["draft", "sent", "accepted", "signed", "paid", "void"];
