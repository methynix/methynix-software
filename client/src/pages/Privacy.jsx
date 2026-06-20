import { SITE } from "../constants/site";

const LAST_UPDATED = "20 June 2026";

const Section = ({ n, title, children }) => (
  <section className="py-7 border-b border-line">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8">
      <div className="md:col-span-3">
        <span className="font-mono text-xs text-faint">{n}</span>
        <h2 className="font-display text-xl font-semibold mt-1">{title}</h2>
      </div>
      <div className="md:col-span-9 space-y-3 text-dim leading-relaxed">{children}</div>
    </div>
  </section>
);

export const Privacy = () => (
  <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-20">
    <p className="eyebrow mb-5">Legal</p>
    <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
      Privacy policy
    </h1>
    <p className="mt-5 text-dim max-w-2xl leading-relaxed">
      This explains what information {SITE.fullName} collects through this website,
      why we collect it, and what we do with it.
    </p>
    <p className="mt-3 font-mono text-xs text-faint">Last updated: {LAST_UPDATED}</p>

    <div className="mt-12 border-t border-line">
      <Section n="01" title="Information we collect">
        <p>
          When you use the contact form, we collect the details you give us: your
          name, email address, phone number if you add it, the type of work you
          are interested in, and your message.
        </p>
        <p>
          Like most websites, our server may also record basic technical
          information such as your IP address and the time of a request, which
          helps us keep the site secure and working.
        </p>
      </Section>

      <Section n="02" title="How we use it">
        <p>
          We use the details from the contact form to read your message, reply to
          you, and discuss or carry out the work you ask about. We do not use them
          for unrelated marketing.
        </p>
      </Section>

      <Section n="03" title="The basis for using it">
        <p>
          We use your information because you chose to send it to us in order to
          start a conversation, and because we need it to respond to you and
          provide the service you requested.
        </p>
      </Section>

      <Section n="04" title="Where it is stored">
        <p>
          Messages are stored in our database, which is hosted on Supabase, and
          emails are sent and delivered using Resend. These providers process the
          data on our behalf and under their own security and privacy terms.
        </p>
      </Section>

      <Section n="05" title="Sharing">
        <p>
          We do not sell your information, and we do not share it with anyone except
          the service providers we use to run the site and reply to you, or where
          the law requires us to.
        </p>
      </Section>

      <Section n="06" title="How long we keep it">
        <p>
          We keep contact messages for as long as we need them to handle your
          enquiry and any work that follows. You can ask us to delete your details
          at any time.
        </p>
      </Section>

      <Section n="07" title="Your choices">
        <p>
          You can ask us what information we hold about you, ask us to correct it,
          or ask us to delete it. To do any of these, email{" "}
          <a href={`mailto:${SITE.email}`} className="text-accent link-underline">{SITE.email}</a>.
        </p>
      </Section>

      <Section n="08" title="Cookies and tracking">
        <p>
          This website does not use advertising cookies or sell your activity. If we
          add analytics in future to understand how the site is used, we will update
          this page first.
        </p>
      </Section>

      <Section n="09" title="Children">
        <p>
          This website is meant for businesses and adults. We do not knowingly
          collect information from children.
        </p>
      </Section>

      <Section n="10" title="Changes and contact">
        <p>
          We may update this policy from time to time. The version on this page,
          with its last updated date, is the current one. For any question about
          your privacy, contact us at{" "}
          <a href={`mailto:${SITE.email}`} className="text-accent link-underline">{SITE.email}</a>.
        </p>
      </Section>
    </div>
  </div>
);
