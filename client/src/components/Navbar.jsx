import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "../constants/site";

const links = [
  { name: "Work", path: "/work" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "What's new", path: "/whats-new" },
   { name: "Terms", path: "/terms" },
  { name: "Privacy", path: "/privacy" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-[100] bg-ink/85 backdrop-blur border-b border-line">
      <nav className="max-w-page mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/logo-advanced.jpeg" alt="Methynix logo" className="h-8 w-8 rounded-full object-contain" />
          <span className="font-display text-lg font-semibold tracking-tight">{SITE.name}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              className={({ isActive }) =>
                `text-sm link-underline ${isActive ? "text-accent" : "text-dim hover:text-text"}`
              }
            >
              {l.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-accent text-accentInk text-sm font-medium hover:bg-accentDeep hover:text-text transition-colors"
          >
            Start a project
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          >
            <motion.span animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-6 h-px bg-text" />
            <motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-px bg-text" />
            <motion.span animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-6 h-px bg-text" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t border-line bg-ink"
          >
            <div className="px-5 py-6 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.path}
                  to={l.path}
                  className={({ isActive }) =>
                    `py-3 text-lg font-display ${isActive ? "text-accent" : "text-text"}`
                  }
                >
                  {l.name}
                </NavLink>
              ))}
              <Link
                to="/contact"
                className="mt-3 px-5 py-3.5 rounded-lg bg-accent text-accentInk text-center font-medium"
              >
                Start a project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
