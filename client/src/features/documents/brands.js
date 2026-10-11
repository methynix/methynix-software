// The two brands documents can be generated under. Everything brand-specific
// on a PDF (letterhead, colours, legal wording, reference prefixes, contacts)
// comes from here.
export const BRANDS = {
  methynix: {
    key: "methynix",
    label: "Methynix",
    name: "METHYNIX SOFTWARE",
    legalName: "Methynix Software Company",
    shortName: "Methynix Software",
    tagline: "Creative & Technology Solutions",
    registration: "BN633674",
    address: "Iyumbu, UDOM (CIVE campus), Dodoma, Tanzania",
    city: "Dodoma",
    website: "www.methynix.com",
    email: "info@methynix.com",
    phone: "+255 715 455 422",
    paymentMobile: "0715 455 422 (Tigo Pesa)",
    operator: "Helen James Method",
    preparer: "Helen Method James",
    preparerTitle: "Founder",
    // Used in "between (1) ... , <entity>, and represented by ..."
    entity:
      "a registered business name (Registration No. BN633674) carrying on the business of software development, with its place of business at Iyumbu, UDOM (CIVE campus), Dodoma, Tanzania",
    partyAlias: "Methynix",
    logo: "/logo.png",
    colors: { primary: "#0e7f8f", accent: "#14b3c6", dark: "#12303a", tint: "#eef6f8" },
    prefixes: { proposal: "MTX-P", contract: "MTX-C", technical: "MTX-T", receipt: "MTX-R" },
  },
  kaspa: {
    key: "kaspa",
    label: "Kaspa",
    name: "KASPA TECHNOLOGIES",
    legalName: "Kaspa Technologies Company Limited",
    shortName: "Kaspa Technologies",
    tagline: "Your reliable technology partner",
    registration: "",
    address: "1st Floor Emirates House, Sinza Madukani, Shekilango Rd, Dar es Salaam, Tanzania",
    city: "Dar es Salaam",
    website: "kaspatech.co.tz",
    email: "info@kaspatech.co.tz",
    phone: "+255 715 455 422",
    paymentMobile: "0715 455 422",
    operator: "Helen Method James",
    preparer: "Helen Method James",
    preparerTitle: "Technical Lead",
    entity:
      "a technology and software development company having its registered office at 1st Floor, Emirates House, Sinza Madukani, Shekilango Rd, Dar es Salaam, Tanzania",
    partyAlias: "Kaspa",
    // Drop the Kaspa logo into client/public with this name. Until then the
    // PDFs show the company name without a logo.
    logo: "/kaspa-logo.png",
    colors: { primary: "#A6192E", accent: "#A6192E", dark: "#1a1d22", tint: "#f3f3f3" },
    prefixes: { proposal: "NTD-", contract: "CTT-", technical: "NTD-", receipt: "KSP-R" },
  },
};

export const BRAND_LIST = Object.values(BRANDS);

export const getBrand = (key) => BRANDS[key] || BRANDS.methynix;

// Project ref 8 + kaspa proposal -> "NTD-0008".
export const makeReference = (brandKey, type, refNo) => {
  if (!refNo) return "";
  const prefix = getBrand(brandKey).prefixes[type] || "REF-";
  return `${prefix}${String(refNo).padStart(4, "0")}`;
};
