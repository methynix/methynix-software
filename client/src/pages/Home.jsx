import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient from "../api/apiClient";
import { SITE, DISCIPLINES } from "../constants/site";
import { Button } from "../components/ui/Button";
import { ProjectThumb } from "../components/ProjectThumb";
import { ServiceCarousel } from "../components/ServiceCarousel";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

export const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    apiClient
      .get("/projects")
      .then((res) => setFeatured((res.data.data || []).slice(0, 3)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      {/* Full-screen hero: fills the view under the sticky 4rem navbar. */}
      <section className="relative isolate overflow-hidden min-h-[calc(100svh-4rem)] flex items-center">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {SITE.assets.heroBg ? (
            <img src={SITE.assets.heroBg} alt="" className="h-full w-full object-cover opacity-60" fetchpriority="high" />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_40%,rgba(79,209,197,0.16),transparent_70%),radial-gradient(45%_40%_at_10%_90%,rgba(227,184,115,0.10),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#F4F3EF_1px,transparent_1px),linear-gradient(to_bottom,#F4F3EF_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_70%_at_50%_45%,#000,transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <div className="max-w-page mx-auto w-full px-5 md:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
            <div className="lg:col-span-6">
              <motion.p variants={fade} initial="hidden" animate="show" className="eyebrow mb-6">
                Software studio — {SITE.city}
              </motion.p>
              <motion.h1
                variants={fade}
                initial="hidden"
                animate="show"
                custom={1}
                className="font-display font-semibold tracking-tight leading-[1.04] text-4xl sm:text-5xl xl:text-6xl"
              >
                We build software for
                <br />
                <span className="bg-gradient-to-r from-accent to-sand bg-clip-text text-transparent">businesses in Tanzania.</span>
              </motion.h1>
              <motion.p variants={fade} initial="hidden" animate="show" custom={2} className="mt-7 text-lg text-dim leading-relaxed max-w-xl">
                Methynix is a small team that builds websites, mobile apps and desktop
                programs. We also do 2D animation. We focus on work that is clear,
                reliable, and easy for your customers to use.
              </motion.p>
              <motion.div variants={fade} initial="hidden" animate="show" custom={3} className="mt-9 flex flex-wrap gap-3">
                <Button as="link" to="/contact" size="lg">
                  Start a project
                </Button>
                <Button as="link" to="/work" size="lg" variant="ghost">
                  See our work
                </Button>
              </motion.div>
              <motion.p variants={fade} initial="hidden" animate="show" custom={4} className="mt-8 font-mono text-xs text-faint">
                Built in Dodoma · Since {SITE.founded}
              </motion.p>
            </div>

            <motion.div variants={fade} initial="hidden" animate="show" custom={2} className="lg:col-span-6">
              <ServiceCarousel />
            </motion.div>
          </div>
        </div>

        <a href="#what-we-make" aria-label="Scroll to what we make" className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-faint hover:text-text transition-colors">
          <span className="font-mono text-[10px] uppercase tracking-label">Scroll</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="block text-lg leading-none">↓</motion.span>
        </a>
      </section>

      <section id="what-we-make" className="max-w-page mx-auto px-5 md:px-8 py-16 scroll-mt-16">
        <div className="flex items-end justify-between mb-2">
          <h2 className="font-display text-2xl md:text-3xl font-semibold">What we make</h2>
          <span className="font-mono text-xs text-faint hidden sm:block">04 disciplines</span>
        </div>
        <div className="rule mt-4">
          {DISCIPLINES.map((d) => (
            <div
              key={d.key}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-6 border-b border-line items-baseline"
            >
              <div className="md:col-span-4 flex items-center gap-3">
                <h3 className="font-display text-xl font-medium">{d.name}</h3>
                {d.comingSoon ? (
                  <span className="font-mono text-[10px] uppercase tracking-label text-sand border border-sand/40 rounded-full px-2 py-0.5">
                    Coming soon
                  </span>
                ) : null}
              </div>
              <p className="md:col-span-6 text-dim leading-relaxed">{d.plain}</p>
              <div className="md:col-span-2 flex md:justify-end flex-wrap gap-1.5">
                {d.tools.map((t) => (
                  <span key={t} className="font-mono text-[11px] text-faint">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Link
            to="/services"
            className="text-sm font-medium text-sand hover:text-sand/80 inline-flex items-center gap-2 group transition-colors"
          >
            <span>See what we can build for you</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="max-w-page mx-auto px-5 md:px-8 py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Selected work</h2>
            <Link to="/work" className="text-sm text-accent link-underline">
              All work
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p) => (
              <Link
                key={p.id}
                to="/work"
                className="group rounded-xl overflow-hidden border border-line bg-surface hover:border-accent/40 transition-colors"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <ProjectThumb imageUrl={p.image_url} name={p.name} className="group-hover:scale-[1.03] transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-dim mt-1 line-clamp-2">{p.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="max-w-page mx-auto px-5 md:px-8 py-16">
        <div className="rounded-2xl border border-line bg-surface px-7 py-12 md:px-12 md:py-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Have a project in mind?</h2>
            <p className="text-dim mt-2 max-w-md">
              Tell us what you need. We will reply with honest advice on what it
              takes and what it costs.
            </p>
          </div>
          <Button as="link" to="/contact" size="lg">
            Start a project
          </Button>
        </div>
      </section>
    </div>
  );
};
