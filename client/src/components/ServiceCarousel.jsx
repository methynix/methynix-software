import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { BUILD_CATEGORIES } from "../pages/Services";

// A ring of service cards turning in 3D. It steps one card at a time so each
// title can be read, pauses while the pointer is over it, and can be driven
// with the arrows or dots.
const SERVICES = BUILD_CATEGORIES.filter((s) => s.image);
const STEP_MS = 3800;

const useCardWidth = () => {
  const get = () => (typeof window === "undefined" ? 240 : window.innerWidth < 640 ? 190 : window.innerWidth < 1024 ? 220 : 250);
  const [w, setW] = useState(get);
  useEffect(() => {
    const on = () => setW(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
};

export const ServiceCarousel = () => {
  const reduce = useReducedMotion();
  const n = SERVICES.length;
  const angle = 360 / n;
  const [step, setStep] = useState(0);
  const paused = useRef(false);
  const width = useCardWidth();
  const height = Math.round(width * 1.28);
  // Distance from the centre so neighbouring cards sit side by side with a gap.
  const radius = useMemo(() => Math.round((width + 28) / 2 / Math.tan(Math.PI / n)), [width, n]);
  const active = ((step % n) + n) % n;

  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => {
      if (!paused.current) setStep((s) => s + 1);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const go = (to) => {
    // Shortest way round to the chosen card.
    const diff = ((to - active + n + n / 2) % n) - n / 2;
    setStep((s) => s + Math.round(diff));
  };

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      aria-roledescription="carousel"
      aria-label="What we build"
    >
      <div className="relative mx-auto" style={{ height: height + 24, perspective: 1500 }}>
        <motion.div
          className="absolute left-1/2 top-3"
          style={{ width, height, marginLeft: -width / 2, transformStyle: "preserve-3d", translateZ: -radius }}
          animate={{ rotateY: -step * angle }}
          transition={{ type: "spring", stiffness: 55, damping: 16, mass: 1.1 }}
        >
          {SERVICES.map((s, i) => {
            const isActive = i === active;
            return (
              <div
                key={s.id}
                className="absolute inset-0"
                style={{ transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`, backfaceVisibility: "hidden" }}
                aria-hidden={!isActive}
              >
                <Link
                  to="/services"
                  tabIndex={isActive ? 0 : -1}
                  className={`group relative block h-full w-full overflow-hidden rounded-2xl border bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] transition-[border-color,opacity] duration-500 ${
                    isActive ? "border-accent/50 opacity-100" : "border-line opacity-60"
                  }`}
                >
                  <img src={s.image} alt={s.title} loading={i < 2 ? "eager" : "lazy"} draggable="false" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-label text-accent">{s.category}</p>
                    <p className="mt-1 font-display text-base font-semibold leading-snug text-text">{s.title}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </motion.div>
        {/* Soft floor glow under the ring */}
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-10 rounded-[50%] bg-accent/20 blur-2xl" />
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button onClick={() => go(active - 1)} aria-label="Previous" className="h-8 w-8 rounded-full border border-line text-dim hover:text-text hover:border-accent/50 transition-colors">←</button>
        <div className="flex gap-1.5">
          {SERVICES.map((s, i) => (
            <button key={s.id} onClick={() => go(i)} aria-label={s.title} className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-accent" : "w-1.5 bg-raised hover:bg-faint"}`} />
          ))}
        </div>
        <button onClick={() => go(active + 1)} aria-label="Next" className="h-8 w-8 rounded-full border border-line text-dim hover:text-text hover:border-accent/50 transition-colors">→</button>
      </div>
    </div>
  );
};
