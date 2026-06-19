import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient from "../api/apiClient";
import { SITE, DISCIPLINES } from "../constants/site";
import { Button } from "../components/ui/Button";
import { ProjectThumb } from "../components/ProjectThumb";

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
      <section className="max-w-page mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <motion.p variants={fade} initial="hidden" animate="show" className="eyebrow mb-6">
              Software studio — {SITE.city}
            </motion.p>
            <motion.h1
              variants={fade}
              initial="hidden"
              animate="show"
              custom={1}
              className="font-display font-semibold tracking-tight leading-[1.04] text-4xl sm:text-5xl md:text-6xl"
            >
              We build software for
              <br />
              businesses in Tanzania.
            </motion.h1>
            <motion.p
              variants={fade}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-7 text-lg text-dim leading-relaxed max-w-xl"
            >
              Methynix is a small team that builds websites, mobile apps and desktop
              programs. We also do 2D animation. We focus on work that is clear,
              reliable, and easy for your customers to use.
            </motion.p>
            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Button as="link" to="/contact" size="lg">
                Start a project
              </Button>
              <Button as="link" to="/work" size="lg" variant="ghost">
                See our work
              </Button>
            </motion.div>
          </div>

          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            custom={2}
            className="lg:col-span-5"
          >
            <figure className="rounded-2xl overflow-hidden border border-line bg-surface">
              <img src="/methynix.jpg" alt="" className="w-full h-64 object-cover" />
              <figcaption className="px-5 py-4 flex items-center justify-between">
                <span className="text-sm text-text">Built in Dodoma</span>
                <span className="font-mono text-xs text-faint">Since {SITE.founded}</span>
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </section>

      <section className="max-w-page mx-auto px-5 md:px-8 py-8">
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
