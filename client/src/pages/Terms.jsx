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

export const Terms = () => (
  <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-20">
    <p className="eyebrow mb-5">Legal</p>
    <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
      Terms and conditions
    </h1>
    <p className="mt-5 text-dim max-w-2xl leading-relaxed">
      These terms explain what you can expect from {SITE.fullName} and what we
      expect from you when we work together. By hiring us or using this website,
      you agree to them.
    </p>
    <p className="mt-3 font-mono text-xs text-faint">Last updated: {LAST_UPDATED}</p>

    <div className="mt-12 border-t border-line">
      <Section n="01" title="What we do">
        <p>
          {SITE.fullName} is a software studio based in {SITE.city}. Our work is
          building software, websites, mobile apps and desktop programs, and
          creating 2D animation. We do this work only. We do not provide legal,
          financial, accounting, security auditing, or other professional advice,
          and nothing we deliver should be treated as such.
        </p>
      </Section>

      <Section n="02" title="How a project works">
        <p>
          Before we start, we agree on the scope, price, timeline and what will be
          delivered. That agreement, together with these terms, governs the
          project. Work outside the agreed scope is treated as a new request and
          may change the price and timeline.
        </p>
        <p>
          Payment terms are set out in each project agreement. We may pause or stop
          work if an agreed payment is overdue.
        </p>
      </Section>

      <Section n="03" title="Ownership and handover">
        <p>
          Once a project is fully paid, the final deliverables we create for you
          are yours. The accounts, code and data are handed over to you. Tools,
          libraries and frameworks we use that belong to third parties remain
          under their own licences.
        </p>
        <p>
          Unless you ask us not to, we may show the finished work in our portfolio
          and on our Work page as an example of what we have built.
        </p>
      </Section>

      <Section n="04" title="Your responsibilities">
        <p>
          You agree to give us the content, access and information we need on time,
          to make sure you have the right to use anything you give us (text,
          images, logos, data), and to use what we build for you in a lawful and
          honest way.
        </p>
      </Section>

      <Section n="05" title="Acceptable use and our limits of responsibility">
        <p>
          Our job is to build the software or animation described in the project
          agreement, to a reasonable professional standard. We are not responsible
          for how a deliverable is used after it leaves our hands.
        </p>
        <p>
          In particular, we are not responsible or liable for any use of our work
          that is unlawful, dishonest, harmful or against good morals. This
          includes, but is not limited to, using software we built to carry out or
          enable theft, fraud, hacking, unauthorised access or any other crime, and
          using animation or other content we produced to spread material that is
          illegal, defamatory, obscene, or that promotes immorality, hatred or
          harm. The person who uses or directs the use of the work is responsible
          for that use, not {SITE.fullName}.
        </p>
        <p>
          You agree to cover and defend us against any claim, loss or cost that
          comes from your use, or a third party's use, of the work in a way that
          breaks the law or these terms.
        </p>
      </Section>

      <Section n="06" title="Warranties and liability">
        <p>
          We take care to deliver work that matches the agreed scope. Beyond what
          is written in the project agreement, the work is provided as is, without
          other guarantees. We do not promise that software will be free of every
          bug or that it will never go offline.
        </p>
        <p>
          To the extent the law allows, {SITE.fullName} is not liable for indirect
          or knock-on losses, including lost profit, lost data or business
          interruption. Where we are found liable, our total responsibility is
          limited to the amount you paid us for the project the claim relates to.
        </p>
      </Section>

      <Section n="07" title="Third-party services">
        <p>
          Projects often rely on services we do not own, such as hosting, domains,
          databases, email delivery and payment providers. Those services are
          governed by their own terms, and we are not responsible for their
          availability, pricing or actions.
        </p>
      </Section>

      <Section n="08" title="Confidentiality">
        <p>
          We keep the private information you share with us for a project
          confidential and use it only to do the work. We expect the same from you
          regarding our methods and pricing.
        </p>
      </Section>

      <Section n="09" title="Changes to these terms">
        <p>
          We may update these terms from time to time. The version published on
          this page, with its last updated date, is the one that applies.
        </p>
      </Section>

      <Section n="10" title="Governing law and contact">
        <p>
          These terms are governed by the laws of the United Republic of Tanzania.
          Questions about them can be sent to{" "}
          <a href={`mailto:${SITE.email}`} className="text-accent link-underline">{SITE.email}</a>.
        </p>
      </Section>
    </div>
  </div>
);
