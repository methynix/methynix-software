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
