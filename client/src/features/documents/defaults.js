import { getBrand, makeReference } from "./brands";
import { todayISO, formatTZS, toNumber } from "./format";

export const emptyClient = () => ({ name: "", email: "", phone: "", address: "" });

// Client block for a document, taken from a pipeline project.
const clientFrom = (project) =>
  project
    ? {
        name: project.client.company || project.client.name || "",
        email: project.client.email || "",
        phone: project.client.phone || "",
        address: project.client.address || "",
      }
    : emptyClient();

const base = (type, brand, project) => ({
  type,
  number: "",
  status: "draft",
  title: project?.name || "",
  project_id: project?.id || null,
  client: clientFrom(project),
  total: 0,
});

const SCOPE_LABEL = { web: "Web only", mobile: "Mobile app", desktop: "Desktop app", animation: "Animation" };

// ---------------------------------------------------------------- proposal

const proposalData = (brandKey, project) => {
  const brand = getBrand(brandKey);
  const recurring = (project?.production_costs || [])
    .filter((c) => c.item)
    .map((c) => ({
      item: c.item,
      cost: c.amount ? `${formatTZS(c.amount)} per ${c.cycle === "monthly" ? "month" : "year"}` : "Variable",
    }));

  return {
    brand: brandKey,
    reference: makeReference(brandKey, "proposal", project?.ref_no),
    date: todayISO(),
    preparedBy: brand.preparer,
    projectTitle: project?.name || "",
    overview: project?.description || "",
    modules: [
      { module: "Admin Panel & User Management", description: "" },
      { module: "", description: "" },
      { module: "", description: "" },
    ],
    features: ["Role-based access for all user types", "Responsive design that works on phones, tablets and computers", "Scalable architecture for future growth"],
    services: [
      { service: "Domain Registration", purpose: "Platform web address", provider: "Cloudflare" },
      { service: "Web Hosting / Server", purpose: "Hosting the application", provider: "Render / DigitalOcean" },
      { service: "Database Hosting", purpose: "Storing system data", provider: "MongoDB Atlas / Managed PostgreSQL" },
      { service: "Email Notifications", purpose: "System alerts and account emails", provider: "Resend" },
    ],
    devScopeLabel: SCOPE_LABEL[project?.type] || "",
    devCosts: project?.quote
      ? [{ component: "Design, development, testing & deployment", cost: String(project.quote), note: "" }]
      : [
          { component: "Setup, Infrastructure, Security, Auth & Roles", cost: "", note: "" },
          { component: "Admin Panel", cost: "", note: "" },
          { component: "Testing, Security & Deployment", cost: "", note: "" },
        ],
    depositPercent: 40,
    recurring: recurring.length
      ? recurring
      : [
          { item: "Domain Registration", cost: "" },
          { item: "Cloud Hosting (Server + Database)", cost: "" },
          { item: "Maintenance & Support", cost: "Variable" },
        ],
    recurringTotal: "",
    recurringNote: "The costs above can be paid on a year basis",
    timeline: [
      { phase: "Phase 0 – Foundation (discovery, database design, security, role authorisation)", duration: "", days: "" },
      { phase: "Phase 1 – Core Modules", duration: "", days: "" },
      { phase: "Phase 2 – Integrations & Secondary Modules", duration: "", days: "" },
      { phase: "Phase 3 – Testing & Launch (comprehensive testing, bug fixing, going live)", duration: "", days: "" },
    ],
    timelineTotal: "",
    timelineNote: "Continuous feedback will be provided",
    terms: [
      "Payment Schedule: 40% upfront deposit to initiate the project, 60% on final delivery.",
      "Warranty: 3 months free bug fixes after launch.",
      "Maintenance Contract: Optional, renewable yearly at a variable price.",
      "Ownership: Full source code and assets transferred upon final payment.",
    ],
    conclusion: "",
    validityDays: 30,
  };
};

export const proposalTotal = (d = {}) => (d.devCosts || []).reduce((s, r) => s + toNumber(r.cost), 0);
const timelineDays = (d = {}) => (d.timeline || []).reduce((s, r) => s + toNumber(r.days), 0);

// ---------------------------------------------------------------- contract

// "Phase 1 – Admin & Backend (admin panel, ...)" -> "Phase 1 - Admin & Backend"
const phaseName = (p) => p.replace(/\s*\(.*\)\s*$/, "").replace(/\s+[–—]\s+/, " - ");

const agreementData = (brandKey, project, proposal) => {
  const brand = getBrand(brandKey);
  const pd = proposal?.data || {};
  const days = timelineDays(pd);
  return {
    template: "agreement-v1",
    brand: brandKey,
    reference: makeReference(brandKey, "contract", project?.ref_no),
    date: todayISO(),
    projectTitle: pd.projectTitle || project?.name || "",
    representative: brand.preparer,
    proposalRef: pd.reference || proposal?.number || "",
    proposalDate: pd.date || "",
    systemModules: (pd.modules || []).map((m) => m.module).filter(Boolean),
    scopePrinciple: "",
    phases: (pd.timeline || []).map((t) => t.phase && phaseName(t.phase)).filter(Boolean),
    durationText: pd.timelineTotal ? `approximately ${pd.timelineTotal}` : days ? `approximately ${days} working days` : "",
    totalFee: String(proposalTotal(pd) || project?.quote || ""),
    depositPercent: pd.depositPercent || 40,
    recurringEstimate: pd.recurringTotal || "",
    warrantyMonths: 3,
    cureDays: 14,
    disputeDays: 30,
    providerSignature: null,
    providerSignDate: todayISO(),
  };
};

// ---------------------------------------------------------------- technical

const p = (text) => ({ type: "paragraph", text });
const h = (text) => ({ type: "heading", text });
const ul = (items) => ({ type: "bullets", items });
const ol = (items) => ({ type: "numbered", items });
const table = (caption, columns, rows, widths) => ({ type: "table", caption, columns, rows, widths });
const img = (caption) => ({ type: "image", src: null, caption });

const technicalData = (brandKey, project, proposal) => {
  const brand = getBrand(brandKey);
  const pd = proposal?.data || {};
  const title = pd.projectTitle || project?.name || "the system";
  const clientName = project?.client?.name || proposal?.client?.name || "the client";
  const proposalRef = pd.reference || proposal?.number || "";
  const total = proposalTotal(pd) || project?.quote || 0;
  const days = timelineDays(pd);
  const modules = (pd.modules || []).filter((m) => m.module);
  const today = todayISO();

  return {
    brand: brandKey,
    reference: makeReference(brandKey, "technical", project?.ref_no),
    version: "1.0",
    docStatus: "Draft for client review",
    date: today,
    projectTitle: pd.projectTitle || project?.name || "",
    preparedBy: brand.preparer,
    versions: [{ version: "1.0", date: today, author: brand.preparer, changes: proposalRef ? `Initial version based on proposal ${proposalRef}` : "Initial version" }],
    approvals: [
      { name: clientName, role: "Client", date: "" },
      { name: brand.preparer, role: brand.preparerTitle, date: today },
    ],
    sections: [
      {
        title: "Introduction",
        blocks: [
          h("Purpose"),
          p(`This document explains how ${title} will be built. It takes the approved project proposal${proposalRef ? ` (reference ${proposalRef})` : ""} and turns it into a technical plan that covers the architecture, database, API, security, testing and deployment.`),
          p(`It is written for three groups of readers: the ${brand.shortName} development team who will build the system, the client who needs to confirm that the design matches what was agreed, and anyone who will test, host or maintain the platform later.`),
          h("Scope"),
          p("The table below shows what is included now and what is left for a future phase."),
          table("", ["In Scope", "Out of Scope (future phase)"], modules.length ? modules.map((m) => [m.module, ""]) : [["", ""], ["", ""]]),
          h("Definitions & Abbreviations"),
          table("", ["Term", "Meaning"], [
            ["RBAC", "Role-Based Access Control. Each user has a role and the role decides what they can do."],
            ["API", "Application Programming Interface. The backend service the web app talks to."],
            ["JWT", "JSON Web Token. A signed token that proves who is logged in."],
            ["UAT", "User Acceptance Testing. Testing done by the client before go-live."],
          ], [1, 3]),
          h("References"),
          ul([
            proposalRef ? `Project Proposal (System Overview), Reference ${proposalRef}${pd.date ? `, dated ${pd.date.split("-").reverse().join("/")}` : ""}, prepared for ${clientName}.` : "",
            "Requirements and feedback from discussions with the client.",
            "The Personal Data Protection Act, 2022 (Tanzania) and guidance from the Personal Data Protection Commission (PDPC).",
          ]),
        ],
      },
      {
        title: "System Overview",
        blocks: [
          h("Summary"),
          p(pd.overview || project?.description || ""),
          h("Users & Roles"),
          table("", ["Role", "Description / Access"], [["Admin", "Runs the platform, manages users and settings, views all activity."], ["", ""]], [1, 3]),
          h("Assumptions & Constraints"),
          ul([
            days ? `Timeline: about ${days} working days from the date the deposit is received, as in the proposal.` : "Timeline: as set out in the proposal, from the date the deposit is received.",
            total ? `Budget: TZS ${formatTZS(total)} one-time development cost. Hosting, domain and storage are paid separately by the client.` : "",
            "Devices and internet: most users will use phones on 3G or 4G, so pages must be light.",
            "Language: the interface is in English for this phase.",
          ]),
        ],
      },
      {
        title: "Requirements",
        blocks: [
          h("Functional Requirements"),
          p("Priority: Must = required for launch, Should = important, Could = nice to have."),
          table("", ["ID", "Module", "Requirement", "Priority"],
            (modules.length ? modules : [{ module: "", description: "" }]).map((m, i) => [
              `FR-${String(i + 1).padStart(2, "0")}`, m.module, m.description ? `The system shall ${m.description.charAt(0).toLowerCase()}${m.description.slice(1)}` : "", "Must",
            ]), [0.7, 1.2, 3.4, 0.8]),
          h("Non-Functional Requirements"),
          table("", ["ID", "Category", "Requirement"], [
            ["NFR-01", "Performance", "Normal pages load within 3 seconds on a 4G connection."],
            ["NFR-02", "Security", "HTTPS only. Passwords stored as bcrypt hashes. Every API request checks the user's role on the server."],
            ["NFR-03", "Availability", "At least 99% uptime per month, excluding planned maintenance announced in advance."],
            ["NFR-04", "Usability", "Mobile-first design that works on screens from 360 pixels wide. Simple English and clear buttons."],
            ["NFR-05", "Maintainability", "Code kept in a Git repository, with clear folder structure and a README for setup."],
            ["NFR-06", "Data Protection", "Personal data handled according to the Personal Data Protection Act, 2022. Daily database backups."],
          ], [0.8, 1.2, 4]),
          h("Business Rules"),
          ol([""]),
        ],
      },
      {
        title: "System Architecture",
        blocks: [
          h("Architecture Overview"),
          p("The platform has a simple layered design. Users open the site in a browser. The frontend shows the pages, and the backend API holds all the business rules. Only the API talks to the database, file storage and outside services."),
          img("System Architecture"),
          h("Technology Stack"),
          table("", ["Layer", "Technology", "Purpose"], [
            ["Frontend", "React, Tailwind CSS", "User interface for all roles"],
            ["Backend", "Node.js (LTS), Express", "Business logic and REST API"],
            ["Database", "", "Main data storage"],
            ["Storage", "Cloudflare R2 (S3 compatible)", "Files and uploads"],
            ["DNS & SSL", "Cloudflare", "Domain, HTTPS, basic firewall"],
            ["Version control", "GitHub (private repository)", "Source code and history"],
          ]),
          h("Third-Party Integrations"),
          table("", ["Service", "Provider", "Purpose", "Notes"],
            (pd.services || []).filter((s) => s.service).map((s) => [s.service, s.provider, s.purpose, ""])),
          h("Deployment Architecture"),
          p(""),
          img("Deployment Architecture"),
          table("", ["Environment", "URL / Server", "Purpose"], [
            ["Development", "localhost", "Daily development on developer machines"],
            ["Staging", "", "Testing and client review before each release"],
            ["Production", "", "Live system"],
          ]),
        ],
      },
      {
        title: "System Design",
        blocks: [h("Use Case Diagram"), p("The diagram below shows what each role can do on the platform."), img("Use Case Diagram"), h("Key Workflows"), p(""), img("")],
      },
      {
        title: "Database Design",
        blocks: [
          h("Entity Relationship Diagram (ERD)"),
          img("Entity Relationship Diagram"),
          h("Table Definitions"),
          table("users  Every person who logs in.", ["Field", "Type", "Constraints", "Description"], [
            ["id", "UUID", "PK", "Unique identifier"],
            ["full_name", "VARCHAR(120)", "NOT NULL", "Full name"],
            ["email", "VARCHAR(150)", "UNIQUE, NULL", "Email address"],
            ["password_hash", "VARCHAR(255)", "NOT NULL", "bcrypt hash, never the real password"],
            ["role", "ENUM", "", "User role"],
          ]),
          h("Relationships"),
          ul([""]),
          h("Data Backup & Retention"),
          ul(["Automatic daily database backups.", "A restore test is done once a month on the staging environment."]),
        ],
      },
      {
        title: "API Design",
        blocks: [
          p("The frontend talks to the backend through a REST API that sends and receives JSON."),
          ul(["Base URL: https://[client-domain]/api/v1", "Authentication: JWT.", "Validation: every request body is checked before it reaches the business logic."]),
          table("", ["Method", "Endpoint", "Description", "Access"], [
            ["POST", "/auth/login", "User login", "Public"],
            ["GET", "/me", "Current user profile", "All"],
          ], [0.8, 1.8, 2, 1]),
        ],
      },
      {
        title: "Security Design",
        blocks: [
          h("Authentication & Authorization"),
          ul([
            "Passwords must have at least 8 characters with letters and numbers. They are stored as bcrypt hashes.",
            "After 5 failed logins the account is locked for 15 minutes. Login endpoints are rate limited.",
            "Every API route has a role check on the server, plus an ownership check.",
          ]),
          h("Access Matrix"),
          table("", ["Module", "Admin", "User"], [["", "", ""]]),
          h("Data Protection & Compliance"),
          ul([
            "All traffic uses HTTPS.",
            "Files in storage are private and shared only through signed links that expire after a few minutes.",
            "Secrets (database password, API keys) are kept in the host's environment settings, never in the code repository.",
          ]),
        ],
      },
      {
        title: "User Interface",
        blocks: [
          p("The interface is clean and mobile-first, using the agreed theme. Each role has its own dashboard with a simple menu."),
          table("", ["S/N", "Screen", "Purpose", "Role"], [["1", "Login / Register", "Sign in and create account", "All"]], [0.5, 1.6, 2.4, 1]),
        ],
      },
      {
        title: "Testing Strategy",
        blocks: [
          ul([
            "Unit tests: for important logic. Done by developers during each phase.",
            "Integration tests: for API routes, including role checks. Run before every release to staging.",
            "Manual testing: every screen on a small Android phone, a tablet and a laptop.",
            "User Acceptance Testing (UAT): the client tests on staging using the scenarios below and signs off before go-live.",
          ]),
          table("", ["ID", "Test Scenario", "Expected Result", "Status"], [["TC-01", "", "", "Pending"]], [0.6, 2, 2, 0.8]),
        ],
      },
      {
        title: "Deployment & Maintenance",
        blocks: [
          p("Deployment steps"),
          ol([
            "Client confirms the domain name. It is added to Cloudflare with DNS and SSL.",
            "Create the database and the storage bucket.",
            "Deploy the API and frontend services and add the environment settings.",
            "Run a final smoke test on production, then open the platform to users.",
          ]),
          p("Monitoring, backup and support"),
          ul([
            "Uptime monitoring checks the site every 5 minutes and alerts the team if it goes down.",
            `Warranty: 3 months of free bug fixes after launch, as in the proposal.`,
            `Reporting issues: the client reports problems by email (${brand.email}) or phone (${brand.phone}). Critical issues are worked on the same day; other bugs within 3 working days.`,
          ]),
        ],
      },
      {
        title: "Risks & Open Issues",
        blocks: [table("", ["ID", "Risk / Issue", "Mitigation / Action", "Owner"], [["R-01", "", "", ""]], [0.6, 2, 2.4, 0.8])],
      },
    ],
  };
};

// ---------------------------------------------------------------- receipt

const receiptData = (brandKey, project) => ({
  brand: brandKey,
  date: todayISO(),
  paymentFor: project ? `${project.name} — development` : "",
  method: "mobile",
  methodOther: "",
  totalAmount: project?.quote ? String(project.quote) : "",
  amountPaid: "",
  balanceDue: "",
  amountInWords: "",
  receivedByName: getBrand(brandKey).operator,
  signature: null,
});

// A fresh working document. `project` and `proposal` (a saved proposal
// document) are optional and pre-fill everything they can.
export const defaultWorking = (type, { brand = "methynix", project = null, proposal = null } = {}) => {
  const doc = base(type, brand, project);
  if (type === "proposal") {
    doc.data = proposalData(brand, project);
    doc.total = proposalTotal(doc.data);
  } else if (type === "contract") {
    doc.data = agreementData(brand, project, proposal);
    doc.total = toNumber(doc.data.totalFee);
  } else if (type === "technical") {
    doc.data = technicalData(brand, project, proposal);
  } else {
    doc.data = receiptData(brand, project);
    doc.total = toNumber(doc.data.totalAmount);
  }
  return doc;
};

// Switching brand on an existing working doc swaps the reference prefix too.
export const rebrand = (doc, brandKey, project) => {
  const data = { ...doc.data, brand: brandKey };
  if (project?.ref_no && doc.type !== "receipt") data.reference = makeReference(brandKey, doc.type, project.ref_no);
  else if (doc.data.reference) {
    const prev = getBrand(doc.data.brand).prefixes[doc.type];
    const nextPrefix = getBrand(brandKey).prefixes[doc.type];
    if (prev && nextPrefix && doc.data.reference.startsWith(prev)) data.reference = nextPrefix + doc.data.reference.slice(prev.length);
  }
  if (doc.type === "receipt") data.receivedByName = getBrand(brandKey).operator;
  return { ...doc, data };
};
