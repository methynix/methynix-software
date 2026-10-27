const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.MAIL_FROM || "Methynix <onboarding@resend.dev>";
const TO = process.env.MAIL_TO;

const escape = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const teamHtml = (d) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1d22;">
    <h2 style="font-size: 18px; margin: 0 0 4px;">New project enquiry</h2>
    <p style="color: #6b7280; margin: 0 0 20px; font-size: 13px;">Sent from the website contact form.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 8px 0;">${escape(d.name)}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;">${escape(d.email)}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;">${escape(d.phone) || "Not given"}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Needs</td><td style="padding: 8px 0;">${escape(d.need) || "Not given"}</td></tr>
    </table>
    <div style="margin-top: 16px; padding: 16px; background: #f4f4f2; border-radius: 8px;">
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escape(d.message)}</p>
    </div>
    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Reply to this email to respond to ${escape(d.name)} directly.</p>
  </div>
`;

const clientHtml = (d) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1d22;">
    <h2 style="font-size: 18px;">Thanks for reaching out</h2>
    <p style="font-size: 14px; line-height: 1.6;">Hi ${escape(d.name)},</p>
    <p style="font-size: 14px; line-height: 1.6;">We have received your message and will get back to you, usually within a day. Here is a copy of what you sent:</p>
    <div style="margin: 16px 0; padding: 16px; background: #f4f4f2; border-radius: 8px;">
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escape(d.message)}</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6;">— Methynix Software</p>
  </div>
`;

// Documents can go out under either brand. Kaspa mail uses its own sender when
// one is configured (the domain must be verified in Resend), else the default.
const BRAND_MAIL = {
  methynix: { name: "Methynix Software", from: () => FROM },
  kaspa: { name: "Kaspa Technologies", from: () => process.env.MAIL_FROM_KASPA || FROM },
};
const brandMail = (brand) => BRAND_MAIL[brand] || BRAND_MAIL.methynix;

const REMINDER_TO = () => process.env.REMINDER_EMAIL || TO;

const shell = (inner, signature) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1d22;">
    ${inner}
    <p style="font-size: 14px; line-height: 1.6; margin-top: 24px;">— ${escape(signature)}</p>
  </div>
`;

const paragraphs = (text = "") =>
  String(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escape(p.trim())}</p>`)
    .join("");

const send = async (payload) => {
  const { error } = await resend.emails.send(payload);
  if (error) throw new Error(error.message);
};

// A proposal, contract, technical document or receipt sent to a client with
// the PDF attached.
exports.sendClientDocument = async ({ brand, to, subject, message, attachment }) => {
  const b = brandMail(brand);
  await send({
    from: b.from(),
    to,
    replyTo: TO || undefined,
    subject,
    html: shell(paragraphs(message), b.name),
    attachments: attachment ? [{ filename: attachment.filename, content: attachment.content }] : undefined,
  });
};

exports.sendProjectCompleted = async ({ brand, project }) => {
  const b = brandMail(brand);
  const inner = `
    <h2 style="font-size: 18px;">Your project is complete</h2>
    <p style="font-size: 14px; line-height: 1.6;">Hi ${escape(project.client.name || "there")},</p>
    <p style="font-size: 14px; line-height: 1.6;">
      We are happy to let you know that <strong>${escape(project.name)}</strong> has been completed and handed over.
      Thank you for trusting us with it.
    </p>
    <p style="font-size: 14px; line-height: 1.6;">
      If anything needs attention, just reply to this email and we will get on it.
    </p>
  `;
  await send({
    from: b.from(),
    to: project.client.email,
    replyTo: TO || undefined,
    subject: `${project.name} is complete — ${b.name}`,
    html: shell(inner, b.name),
  });
};

// One digest email listing everything that needs attention soon.
exports.sendCustomReminder = async ({ to, title, body, sender }) => {
  const recipient = to || process.env.REMINDER_EMAIL || "methodhelen@gmail.com";
  // The sender is info@methynix.com (or configured MAIL_FROM)
  const fromAddress = FROM.includes("<") ? FROM : `Methynix <${sender || "info@methynix.com"}>`;

  const inner = `
    <h2 style="font-size: 18px; margin: 0 0 12px; color: #1a1d22;">${escape(title)}</h2>
    <div style="margin: 16px 0; padding: 16px; background: #f8fafc; border-left: 4px solid #0d9488; border-radius: 4px;">
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1a1d22;">${escape(body)}</p>
    </div>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">This reminder was scheduled in your Methynix Admin Panel.</p>
  `;

  await send({
    from: fromAddress,
    to: recipient,
    replyTo: "info@methynix.com",
    subject: `Reminder: ${title}`,
    html: shell(inner, "Methynix Reminders"),
  });
};

exports.sendReminderDigest = async (items) => {
  const to = REMINDER_TO();
  if (!to) throw new Error("Set REMINDER_EMAIL or MAIL_TO to receive reminders.");
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 13px; color: #6b7280;">${escape(i.group)}</td>
        <td style="padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 14px;"><strong>${escape(i.title)}</strong><br/><span style="color:#6b7280; font-size: 12px;">${escape(i.detail || "")}</span></td>
        <td style="padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 13px; white-space: nowrap; color: ${i.overdue ? "#b91c1c" : "#1a1d22"};">${escape(i.when)}</td>
      </tr>`
    )
    .join("");
  const inner = `
    <h2 style="font-size: 18px; margin: 0 0 4px;">Things that need your attention</h2>
    <p style="color: #6b7280; margin: 0 0 16px; font-size: 13px;">From the Methynix dashboard.</p>
    <table style="width: 100%; border-collapse: collapse;">${rows}</table>
  `;
  await send({
    from: FROM,
    to,
    subject: `Reminder: ${items.length} item${items.length === 1 ? "" : "s"} due soon`,
    html: shell(inner, "Methynix dashboard"),
  });
};

exports.sendContactEmail = async (data) => {
  if (!TO) {
    throw new Error("MAIL_TO is not set.");
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: data.email,
    subject: `New enquiry — ${data.name} (${data.need || "general"})`,
    html: teamHtml(data),
  });

  if (error) {
    throw new Error(error.message);
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: data.email,
      subject: "We received your message — Methynix Software",
      html: clientHtml(data),
    });
  } catch (err) {
    console.error("Acknowledgement email failed:", err.message);
  }
};
