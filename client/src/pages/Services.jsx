import { Button } from "../components/ui/Button";

const groups = [
  {
    title: "Websites and web apps",
    rows: [
      {
        name: "Company website",
        detail:
          "A clear site that explains what you do, loads fast on phones, and is easy for you to update.",
        tools: ["React", "Tailwind"],
      },
      {
        name: "Online store",
        detail:
          "Product pages, a cart, and checkout. We can connect mobile money and card payments.",
        tools: ["React", "Node.js"],
      },
      {
        name: "Dashboard or admin system",
        detail:
          "A private system for staff to manage orders, customers, stock, or records.",
        tools: ["React", "PostgreSQL"],
      },
    ],
  },
  {
    title: "Mobile apps",
    rows: [
      {
        name: "Android and iOS app",
        detail:
          "One app that runs on both phones, built to keep working when the network is weak.",
        tools: ["React Native"],
      },
      {
        name: "Mobile money features",
        detail:
          "Payments and prompts that fit how people pay in Tanzania.",
        tools: ["APIs"],
      },
    ],
  },
  {
    title: "Desktop software",
    rows: [
      {
        name: "Offline business tools",
        detail:
          "Point-of-sale, records, and reports for shops, schools and offices that cannot rely on internet.",
        tools: ["Electron"],
      },
    ],
  },
  {
    title: "Backend and hosting",
    rows: [
      {
        name: "APIs and databases",
        detail:
          "The part behind the screen that stores your data safely and keeps the app running.",
        tools: ["Node.js", "PostgreSQL"],
      },
      {
        name: "Putting it live",
        detail:
          "We deploy your software, set up your domain, and keep it online.",
        tools: ["Docker", "Cloud hosting"],
      },
    ],
  },
  {
    title: "2D animation",
    note: "This part of the studio is still getting set up. Ask us and we will tell you where we are.",
    rows: [
      {
        name: "Short adverts and explainers",
        detail: "Simple animated clips for social media and ads.",
        tools: ["2D"],
      },
    ],
  },
];

export const Services = () => (
  <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-20">
    <p className="eyebrow mb-5">Services</p>
    <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl leading-tight">
      What we can build for you
    </h1>
    <p className="mt-6 text-lg text-dim max-w-2xl leading-relaxed">
      Plain descriptions, no jargon. If you are not sure which of these you need,
      that is fine. Tell us the problem and we will suggest the simplest way to
      solve it.
    </p>

    <div className="mt-14 space-y-16">
      {groups.map((g) => (
        <section key={g.title}>
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <h2 className="font-display text-2xl font-semibold">{g.title}</h2>
          </div>
          {g.note ? <p className="text-sm text-sand mt-3">{g.note}</p> : null}
          <div>
            {g.rows.map((r) => (
              <div
                key={r.name}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 py-5 border-b border-line items-baseline"
              >
                <h3 className="md:col-span-4 font-medium text-text">{r.name}</h3>
                <p className="md:col-span-6 text-dim leading-relaxed">{r.detail}</p>
                <div className="md:col-span-2 flex md:justify-end flex-wrap gap-1.5">
                  {r.tools.map((t) => (
                    <span key={t} className="font-mono text-[11px] text-faint">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>

    <div className="mt-16 flex flex-wrap items-center gap-4">
      <Button as="link" to="/contact" size="lg">
        Start a project
      </Button>
      <span className="text-dim text-sm">or see what we have built on the Work page.</span>
    </div>
  </div>
);
