import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { ProjectThumb } from "../components/ProjectThumb";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";

const typeLabel = {
  web: "Website",
  mobile: "Mobile app",
  desktop: "Desktop app",
};

const animationTeasers = [
  { id: "a1", name: "Brand advert", tone: "from-accentDeep/30 to-accent/10" },
  { id: "a2", name: "Explainer clip", tone: "from-sand/25 to-accent/10" },
  { id: "a3", name: "Social short", tone: "from-accent/20 to-raised" },
];

const WorkCard = ({ project }) => {
  const card = (
    <>
      <div className="aspect-[16/10] overflow-hidden">
        <ProjectThumb
          imageUrl={project.image_url}
          name={project.name}
          className="group-hover:scale-[1.03] transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-medium">{project.name}</h3>
          <span className="font-mono text-[10px] uppercase tracking-label text-faint shrink-0">
            {typeLabel[project.type] || "Project"}
          </span>
        </div>
        {project.summary ? (
          <p className="text-sm text-dim mt-2 leading-relaxed">{project.summary}</p>
        ) : null}
        {project.url ? (
          <span className="inline-block mt-3 text-sm text-accent link-underline">Visit site</span>
        ) : null}
      </div>
    </>
  );

  const cls =
    "group block rounded-xl overflow-hidden border border-line bg-surface hover:border-accent/40 transition-colors";

  if (project.url) {
    return (
      <a href={project.url} target="_blank" rel="noopener noreferrer" className={cls}>
        {card}
      </a>
    );
  }
  return <div className={cls}>{card}</div>;
};

export const Work = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comingSoon, setComingSoon] = useState(false);

  useEffect(() => {
    apiClient
      .get("/projects")
      .then((res) => setProjects(res.data.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-20">
      <p className="eyebrow mb-5">Work</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl leading-tight">
        Things we have built
      </h1>
      <p className="mt-6 text-lg text-dim max-w-2xl leading-relaxed">
        Websites, apps and software we have shipped. New work is added here as it
        goes live.
      </p>

      <section className="mt-12">
        <div className="flex items-baseline justify-between border-b border-line pb-3 mb-6">
          <h2 className="font-display text-2xl font-semibold">Software</h2>
          {!loading ? (
            <span className="font-mono text-xs text-faint">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          ) : null}
        </div>

        {loading ? (
          <p className="text-dim">Loading work…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
            <p className="font-display text-xl">Our first projects are being added here.</p>
            <p className="text-dim mt-2">Check back soon, or start one with us.</p>
            <div className="mt-6 flex justify-center">
              <Button as="link" to="/contact">Start a project</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <WorkCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between border-b border-line pb-3 mb-6">
          <h2 className="font-display text-2xl font-semibold">Animation</h2>
          <span className="font-mono text-[10px] uppercase tracking-label text-sand border border-sand/40 rounded-full px-2 py-0.5">
            Coming soon
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {animationTeasers.map((a) => (
            <button
              key={a.id}
              onClick={() => setComingSoon(true)}
              className="group text-left rounded-xl overflow-hidden border border-line bg-surface hover:border-sand/40 transition-colors"
            >
              <div className={`aspect-[16/10] bg-gradient-to-br ${a.tone} relative flex items-center justify-center`}>
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-text/70 group-hover:scale-110 transition-transform" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-label text-sand">
                  Coming soon
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-medium">{a.name}</h3>
                <p className="text-sm text-dim mt-1">Tap to learn more.</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Modal
        isOpen={comingSoon}
        onClose={() => setComingSoon(false)}
        title="Coming soon"
        footer={<Button onClick={() => setComingSoon(false)}>Got it</Button>}
      >
        Our animation work is still being set up. If you want animation for an
        advert or explainer, reach out and we will tell you what is possible right
        now.
      </Modal>
    </div>
  );
};
