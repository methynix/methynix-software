// Pipeline stages, in order, with the next step shown on the project page.
export const STAGES = [
  { key: "lead", label: "Lead", tone: "neutral", next: "Reach out and log the client's email and needs." },
  { key: "contacted", label: "Contacted", tone: "neutral", next: "Hold a discovery call, then generate the proposal." },
  { key: "discovery", label: "Discovery", tone: "blue", next: "Generate the proposal and email it to the client." },
  { key: "proposal_sent", label: "Proposal sent", tone: "blue", next: "Wait for the client to accept, then mark accepted." },
  { key: "accepted", label: "Accepted", tone: "sand", next: "Generate the contract from the proposal and send it." },
  { key: "contract_sent", label: "Contract sent", tone: "sand", next: "Upload the signed contract when it comes back." },
  { key: "signed", label: "Signed", tone: "sand", next: "Record the 40% deposit." },
  { key: "deposit_paid", label: "Deposit paid", tone: "accent", next: "Prepare the technical document, then start the work." },
  { key: "in_progress", label: "In progress", tone: "accent", next: "Build it. Mark delivered when you hand it over." },
  { key: "delivered", label: "Delivered", tone: "accent", next: "Collect the balance, then mark completed." },
  { key: "completed", label: "Completed", tone: "accent", next: "Done. The client was emailed automatically." },
  { key: "on_hold", label: "On hold", tone: "neutral", next: "Paused." },
  { key: "lost", label: "Lost", tone: "red", next: "Closed without a deal." },
];

export const stage = (key) => STAGES.find((s) => s.key === key) || STAGES[0];

// Board columns group the stages so the board stays readable.
export const BOARD = [
  { label: "Leads", keys: ["lead", "contacted", "discovery"] },
  { label: "Proposal", keys: ["proposal_sent", "accepted"] },
  { label: "Contract", keys: ["contract_sent", "signed"] },
  { label: "Building", keys: ["deposit_paid", "in_progress"] },
  { label: "Delivered", keys: ["delivered", "completed"] },
];

export const PROJECT_TYPES = [
  { value: "web", label: "Website / web app" },
  { value: "mobile", label: "Mobile app" },
  { value: "desktop", label: "Desktop app" },
  { value: "animation", label: "Animation" },
  { value: "other", label: "Other" },
];

export const SOURCES = [
  { value: "", label: "—" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "social", label: "Social media" },
  { value: "walk_in", label: "Walk-in / call" },
  { value: "other", label: "Other" },
];

export const FILE_CATEGORIES = [
  { value: "signed_contract", label: "Signed contract" },
  { value: "technical_doc", label: "Technical document" },
  { value: "proposal", label: "Proposal" },
  { value: "contract", label: "Contract" },
  { value: "receipt", label: "Receipt" },
  { value: "other", label: "Other" },
];
