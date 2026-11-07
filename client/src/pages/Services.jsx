import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export const BUILD_CATEGORIES = [
  {
    id: "company-website",
    title: "Company Websites",
    category: "Websites & Web Apps",
    description:
      "A fast, polished website that clearly explains what you do, builds credibility with clients, and is effortless for you to update anytime from your phone or laptop.",
    features: [
      "Lightning-fast mobile loading",
      "Easy content management",
      "SEO optimized for Google",
      "Bespoke modern design",
    ],
    tools: ["React", "Tailwind CSS", "Vite"],
    buttonText: "Start Your Website",
    link: "/contact?service=website",
    image:
      "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/company-website.jpg",
    fallbackImage: "/category-images/company-website.jpg",
  },
  {
    id: "online-store",
    title: "Online Stores & E-Commerce",
    category: "E-Commerce",
    description:
      "Full-featured online shop with product catalogs, shopping carts, and a smooth checkout designed specifically for Tanzanian shoppers and global customers.",
    features: [
      "M-Pesa, Airtel & Tigo Pesa",
      "Instant checkout flow",
      "Order & stock tracking",
      "Automated WhatsApp receipts",
    ],
    tools: ["React", "Node.js", "PostgreSQL"],
    buttonText: "Launch Your Store",
    link: "/contact?service=ecommerce",
    image:
      "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/online-store.jpg",
    fallbackImage: "/category-images/online-store.jpg",
  },
  {
    id: "admin-dashboard",
    title: "Dashboards & Admin Systems",
    category: "Business Intelligence",
    description:
      "Custom internal portals for managers and staff to monitor operations, manage customer records, process orders, and review financial performance at a glance.",
    features: [
      "Live analytics & visual charts",
      "Role-based staff permissions",
      "Export reports (PDF & Excel)",
      "Audit logs & secure access",
    ],
    tools: ["React", "PostgreSQL", "REST APIs"],
    buttonText: "Build Your Dashboard",
    link: "/contact?service=dashboard",
    image:
      "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/admin-dashboard.jpg",
    fallbackImage: "/category-images/admin-dashboard.jpg",
  },
  {
    id: "mobile-apps",
    title: "Android & iOS Mobile Apps",
    category: "Mobile Apps",
    description:
      "A single, high-performance codebase that runs seamlessly across both Android and iPhone devices, built to keep functioning smoothly even on weak mobile networks.",
    features: [
      "Published on Google Play & App Store",
      "Offline-first local caching",
      "Instant push notifications",
      "Light on battery & data bundle",
    ],
    tools: ["React Native", "Expo", "iOS & Android"],
    buttonText: "Build Your Mobile App",
    link: "/contact?service=mobile",
    image:
      "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/mobile-apps-ios-android.jpg",
    fallbackImage: "/category-images/mobile-apps-ios-android.jpg",
  },
  {
    id: "mobile-money",
    title: "Mobile Money & Payment Systems",
    category: "Fintech & Payments",
    description:
      "Native Tanzanian payment integrations that eliminate friction. Instant USSD push notifications directly to the customer's phone, QR code payments, and automated reconciliations.",
    features: [
      "Lipa Kwa M-Pesa & Airtel Money",
      "Tigo Pesa & AzamPay support",
      "Instant USSD Push (STK Push)",
      "Zero-delay payment webhooks",
    ],
    tools: ["Telecom APIs", "AzamPay", "Webhooks"],
    buttonText: "Integrate Payments",
    link: "/contact?service=payments",
    image:
      "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/mobile-money-payments.jpg",
    fallbackImage: "/category-images/mobile-money-payments.jpg",
  },
  {
    id: "offline-tools",
    title: "Offline Business & POS Tools",
    category: "Desktop & Retail",
    description:
      "High-speed point-of-sale systems, billing software, and local database records designed for retail shops, pharmacies, schools, and offices that need 100% uptime with zero internet required.",
    features: [
      "Runs completely without internet",
      "Thermal receipt printing",
      "Barcode scanner integration",
      "Daily profit & sales summary",
    ],
    tools: ["Electron", "SQLite", "Hardware Drivers"],
    buttonText: "Get Offline POS",
    link: "/contact?service=pos",
    image:
      "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/offline-pos-business-tools.jpg",
    fallbackImage: "/category-images/offline-pos-business-tools.jpg",
  },
  {
    id: "backend-databases",
    title: "APIs, Databases & Cloud Systems",
    category: "Backend & Infrastructure",
    description:
      "The resilient backbone behind your screens. We architect scalable databases, secure server endpoints, cloud deployments, and automated backups that protect your business data 24/7.",
    features: [
      "High-speed REST endpoints",
      "PostgreSQL with daily backups",
      "Cloud hosting on Docker & R2",
      "99.9% uptime monitoring",
    ],
    tools: ["Node.js", "PostgreSQL", "Docker", "Cloudflare"],
    buttonText: "Architect Your Backend",
    link: "/contact?service=backend",
    image:
      "https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/apis-and-databases.jpg",
    fallbackImage: "/category-images/apis-and-databases.jpg",
  },
];

const additionalServices = [
  {
    title: "Putting it live & Cloud Deployment",
    detail:
      "We deploy your software, configure domains, SSL certificates, automated health checks, and secure cloud backups so your application stays live 24/7 without manual maintenance.",
    tools: ["Docker", "Linux VPS", "Cloudflare"],
  },
  {
    title: "2D Animation & Motion Design",
    note: "Studio setup in progress — open for select commissions.",
    detail:
      "Character animation, explainer videos, and short commercial adverts tailored for social media campaigns, brand launches, and product walk-throughs.",
    tools: ["2D Vector", "After Effects"],
  },
];

export const Services = () => (
  <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-24">
    {/* Page Header */}
    <div className="max-w-3xl">
      <p className="eyebrow mb-4">Capabilities & Solutions</p>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-text leading-[1.08]">
        What we can build for you
      </h1>
      <p className="mt-6 text-lg md:text-xl text-dim leading-relaxed">
        Plain descriptions, transparent engineering, zero buzzwords. Explore each solution below
        to see how we solve real business challenges in Tanzania.
      </p>
    </div>

    {/* Alternating Solutions Section (Left-Right / Right-Left Toggle) */}
    <div className="mt-16 md:mt-24 space-y-20 md:space-y-28">
      {BUILD_CATEGORIES.map((item, index) => {
        const isEven = index % 2 === 0;
        return (
          <section
            key={item.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center border-b border-line/60 pb-16 md:pb-24 last:border-b-0"
          >
            {/* Text Column */}
            <div
              className={`lg:col-span-6 flex flex-col justify-center ${
                isEven ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="eyebrow">{item.category}</span>
                <span className="font-mono text-xs text-faint">/ 0{index + 1}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-semibold text-text tracking-tight leading-tight">
                {item.title}
              </h2>

              <p className="mt-4 text-dim text-base sm:text-lg leading-relaxed">
                {item.description}
              </p>

              {/* Feature Checklist matching inspiration layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-7 pt-1">
                {item.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2.5 text-sm text-text/90">
                    <span className="w-5 h-5 rounded-full border border-sand/40 bg-sand/10 text-sand flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </span>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Tools list */}
              <div className="mt-6 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-mono text-faint mr-1">Stack:</span>
                {item.tools.map((tool) => (
                  <span
                    key={tool}
                    className="font-mono text-[11px] text-dim px-2.5 py-1 rounded bg-surface border border-line"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              {/* Action Button matching the gold/sand rounded pill in inspiration */}
              <div className="mt-8">
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-sand text-ink font-semibold text-sm hover:bg-sand/90 transition-all duration-200 shadow-md shadow-sand/10 hover:shadow-sand/20 hover:gap-3.5 group"
                >
                  <span>{item.buttonText}</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Image Column */}
            <div
              className={`lg:col-span-6 ${
                isEven ? "lg:order-2" : "lg:order-1"
              }`}
            >
              <div className="group relative rounded-2xl md:rounded-3xl overflow-hidden border border-line bg-surface shadow-2xl transition-all duration-500 hover:border-sand/40">
                <div className="aspect-[4/3] md:aspect-[16/11] overflow-hidden bg-ink/60">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      if (e.target.src !== window.location.origin + item.fallbackImage) {
                        e.target.src = item.fallbackImage;
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Subtle vignette/border polish */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl md:rounded-3xl pointer-events-none" />
              </div>
            </div>
          </section>
        );
      })}
    </div>

    {/* Additional Capabilities Section */}
    <div className="mt-20 pt-16 border-t border-line">
      <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3">
        Additional Studio Capabilities
      </h2>
      <p className="text-dim text-base max-w-xl mb-8">
        We also support your team with ongoing operations, cloud deployments, and creative production.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {additionalServices.map((svc) => (
          <div
            key={svc.title}
            className="p-6 md:p-8 rounded-2xl border border-line bg-surface flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-display text-xl font-semibold text-text">{svc.title}</h3>
                {svc.note ? (
                  <span className="font-mono text-[10px] uppercase tracking-label text-sand border border-sand/40 rounded-full px-2 py-0.5 shrink-0">
                    Coming soon
                  </span>
                ) : null}
              </div>
              <p className="text-dim text-sm leading-relaxed mt-3">{svc.detail}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-line/60">
              {svc.tools.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] text-faint px-2 py-0.5 rounded bg-ink border border-line"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Call to Action Banner */}
    <div className="mt-20 rounded-3xl border border-line bg-surface p-8 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <div className="max-w-xl">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-text">
          Have a unique idea or requirement?
        </h2>
        <p className="text-dim text-base md:text-lg mt-3 leading-relaxed">
          Tell us the problem your business is facing. We will review your requirements and provide an
          honest technical breakdown and transparent cost estimate.
        </p>
      </div>
      <Button as="link" to="/contact" size="lg" className="shrink-0">
        Start a project
      </Button>
    </div>
  </div>
);
