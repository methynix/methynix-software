import { SITE } from "../constants/site";
import { Button } from "../components/ui/Button";

const principles = [
  {
    title: "Simple beats clever",
    body: "We build the simplest thing that solves your problem, so it is easy to use and easy to keep running.",
  },
  {
    title: "It has to work on real phones",
    body: "Most people here are on mobile, sometimes on a weak network. We build and test for that, not for a perfect connection.",
  },
  {
    title: "You own your work",
    body: "The code, the accounts and the data are yours. We hand everything over and explain how it works.",
  },
  {
    title: "Honest about cost",
    body: "We tell you what a project really takes before you commit, and we say no when something is not worth building.",
  },
];

export const About = () => {
  const { latitude: lat, longitude: lng, zoom } = SITE.map;
  const d = 0.04;
  const bbox = `${lng - d}%2C${lat - d / 2}%2C${lng + d}%2C${lat + d / 2}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const fullMap = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-20">
      <p className="eyebrow mb-5">About</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl leading-tight">
        A software studio in Dodoma
      </h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-5 text-lg text-dim leading-relaxed">
          <p>
            Methynix is a small, growing team based in Dodoma, Tanzania. We make
            websites, mobile apps and desktop software for businesses, and we are
            building up a 2D animation side of the studio.
          </p>
          <p>
            Software is our main work. We like projects where good software makes
            a real difference for a business: a shop that needs to track stock, a
            service that needs online booking, an organisation that needs records
            in one place.
          </p>
          <p>
            We are early in our story and proud of it. We take on work we can do
            well, we keep our promises, and we grow by doing good work for people
            who recommend us.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <p className="eyebrow mb-4">Where to find us</p>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-faint">Location</dt>
                <dd className="text-text mt-0.5">{SITE.addressLine}</dd>
              </div>
              <div>
                <dt className="text-faint">Email</dt>
                <dd className="mt-0.5">
                  <a href={`mailto:${SITE.email}`} className="text-accent link-underline">{SITE.email}</a>
                </dd>
              </div>
              <div>
                <dt className="text-faint">Phone</dt>
                <dd className="mt-0.5">
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="text-text">{SITE.phone}</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold border-b border-line pb-3">How we work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-8">
          {principles.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-xl font-medium">{p.title}</h3>
              <p className="text-dim mt-2 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between border-b border-line pb-3 mb-6">
          <h2 className="font-display text-2xl font-semibold">On the map</h2>
          <a href={fullMap} target="_blank" rel="noopener noreferrer" className="text-sm text-accent link-underline">
            Open in maps
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden border border-line">
          <iframe
            title={`Map showing ${SITE.map.label}`}
            src={embedSrc}
            className="w-full h-[360px] md:h-[420px] grayscale-[0.2]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="text-sm text-faint mt-3">{SITE.map.label}</p>
      </section>

      <div className="mt-16">
        <Button as="link" to="/contact" size="lg">Work with us</Button>
      </div>
    </div>
  );
};
