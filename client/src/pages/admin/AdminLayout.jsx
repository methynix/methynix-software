import { useState, Suspense } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SITE } from "../../constants/site";
import { Loading } from "./ui";

const icon = (d) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const NAV = [
  { to: "/admin/dashboard", end: true, label: "Overview", icon: icon("M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10") },
  { to: "/admin/dashboard/clients", label: "Clients", icon: icon("M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8M22 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8") },
  { to: "/admin/dashboard/finance", label: "Finance", icon: icon("M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6") },
  { to: "/admin/dashboard/projects", label: "Projects", icon: icon("M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4") },
  { to: "/admin/dashboard/infrastructure", label: "Infrastructure", icon: icon("M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01") },
  { to: "/admin/dashboard/documents", label: "Documents", icon: icon("M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h5") },
  { to: "/admin/dashboard/notes", label: "Notes", icon: icon("M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z") },
  { to: "/admin/dashboard/website", label: "Website", icon: icon("M12 22a10 10 0 100-20 10 10 0 000 20M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20") },
];

const NavItems = ({ onNavigate }) => (
  <nav className="flex flex-col gap-0.5">
    {NAV.map((n) => (
      <NavLink
        key={n.to}
        to={n.to}
        end={n.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive ? "bg-raised text-text" : "text-dim hover:text-text hover:bg-raised/50"
          }`
        }
      >
        {n.icon}
        {n.label}
      </NavLink>
    ))}
  </nav>
);

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => {
    logout();
    navigate("/admin");
  };

  const brand = (
    <div className="flex items-center gap-2.5 px-3">
      <img src="/logo.png" alt="" className="h-8 w-8 rounded-full object-contain" />
      <div className="leading-tight">
        <p className="font-display font-semibold">{SITE.name}</p>
        <p className="text-[11px] text-faint">Headquarters</p>
      </div>
    </div>
  );

  const footer = (
    <div className="mt-auto pt-4 border-t border-line space-y-1">
      <a href="/" target="_blank" rel="noreferrer" className="block px-3 py-2 text-sm text-dim hover:text-text">View site ↗</a>
      <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-dim hover:text-text">Sign out</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-line bg-surface/60 p-4 gap-6">
        {brand}
        <NavItems />
        {footer}
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-line bg-ink/95 backdrop-blur">
        {brand}
        <button onClick={() => setMenuOpen(true)} className="p-2 text-dim hover:text-text" aria-label="Open menu">
          {icon("M4 6h16M4 12h16M4 18h16")}
        </button>
      </header>

      {menuOpen ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-line p-4 flex flex-col gap-6">
            {brand}
            <NavItems onNavigate={() => setMenuOpen(false)} />
            {footer}
          </aside>
        </div>
      ) : null}

      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};
