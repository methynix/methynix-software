// The single source of truth for what a client project is allowed to do next.
// Documents, payments and stages all depend on each other; every check lives
// here so the API and the dashboard never disagree.

const DOC_CATEGORIES = { proposal: "proposal", contract: "contract", technical: "technical_doc" };

const sum = (rows, fn) => rows.reduce((s, r) => s + (fn(r) || 0), 0);

// What exists for this project right now, in terms of documents and money.
exports.readiness = (project, payments = []) => {
  const files = project.files || [];
  const hasFile = (...cats) => files.some((f) => cats.includes(f.category));
  const has = {
    proposal: Boolean(project.proposal_doc_id) || hasFile("proposal"),
    contract: Boolean(project.contract_doc_id) || hasFile("contract", "signed_contract"),
    technical: Boolean(project.technical_doc_id) || hasFile("technical_doc"),
    signed_contract: hasFile("signed_contract"),
  };

  const dev = payments.filter((p) => p.kind === "development");
  const paid = sum(dev, (p) => p.amount);
  const percent = project.deposit_percent || 40;
  const quote = project.quote || 0;
  const depositDue = Math.round(quote * (percent / 100));
  const depositPaid =
    dev.some((p) => ["deposit", "full"].includes(p.stage) || p.is_deposit) || (quote > 0 && paid >= depositDue);

  return {
    has,
    paid,
    deposit_percent: percent,
    deposit_due: depositDue,
    deposit_remaining: Math.max(depositDue - paid, 0),
    deposit_paid: depositPaid,
    balance: Math.max(quote - paid, 0),
  };
};

// Reason a document of this category cannot be added yet, or null.
// Proposal -> contract -> technical document. Everything else is free.
exports.docBlocker = (category, r) => {
  if (category === "contract" && !r.has.proposal) return "Add the proposal first: a contract is built on it.";
  if (category === "signed_contract" && !r.has.contract) return "Add the contract first, then upload its signed copy.";
  if (category === "technical_doc" && !r.has.contract) return "Add the contract first: the technical document comes after it.";
  return null;
};

const fmt = (n) => `TZS ${Math.round(n).toLocaleString("en-US")}`;

// Reason the project cannot move to `target` yet, or null. Past (legacy) work
// is a record only and is never blocked.
exports.stageBlocker = (project, target, r) => {
  if (project.legacy || target === project.status) return null;
  const needDeposit = "The deposit has not been paid yet. Record the deposit payment first.";
  switch (target) {
    case "proposal_sent":
    case "accepted":
      return r.has.proposal ? null : "There is no proposal yet. Generate, upload or link it first.";
    case "contract_sent":
      if (!r.has.proposal) return "There is no proposal yet. Add it first.";
      return r.has.contract ? null : "There is no contract yet. Generate, upload or link it first.";
    case "signed":
      return r.has.contract ? null : "There is no contract yet.";
    case "deposit_paid":
    case "in_progress":
    case "delivered":
      return r.deposit_paid ? null : needDeposit;
    case "completed":
      if (!r.deposit_paid) return needDeposit;
      if ((project.quote || 0) > 0 && r.balance > 0) return `${fmt(r.balance)} is still unpaid. Record the remaining balance before completing.`;
      return null;
    case "maintenance":
      return ["completed", "maintenance"].includes(project.status) ? null : "Only a completed project can go into maintenance.";
    default:
      return null;
  }
};

exports.DOC_CATEGORIES = DOC_CATEGORIES;
