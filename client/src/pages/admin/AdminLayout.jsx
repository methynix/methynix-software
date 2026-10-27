import { useState, Suspense } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { authApi } from "../../api/adminApi";
import { SITE } from "../../constants/site";
import { SkeletonPage } from "../../components/ui/Skeleton";
import { Dialog, Button } from "./ui";

const icon = (d) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const NAV = [
  { to: "/admin/dashboard", end: true, label: "Overview", icon: icon("M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10") },
  { to: "/admin/dashboard/clients", label: "Clients", icon: icon("M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8M22 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8") },
  { to: "/admin/dashboard/reminders", label: "Reminders", icon: icon("M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9") },
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
            isActive ? "bg-raised text-text font-medium" : "text-dim hover:text-text hover:bg-raised/50"
          }`
        }
      >
        {n.icon}
        {n.label}
      </NavLink>
    ))}
  </nav>
);

const ChangePasswordModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const { showToast } = useUI();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    setShowPass(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!form.currentPassword) {
      return setError("Enter your current password.");
    }
    if (!form.newPassword) {
      return setError("Enter your new password.");
    }
    if (form.newPassword.length < 8) {
      return setError("New password must be at least 8 characters long.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError("New passwords do not match.");
    }
    if (form.currentPassword === form.newPassword) {
      return setError("New password must be different from current password.");
    }

    setLoading(true);
    try {
      const res = await authApi.changePassword(form);
      if (res.token) login(res.token);
      showToast("Password updated successfully.");
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Change admin password"
      footer={
        <>
          <Button variant="subtle" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-dim">
          Keep your Methynix administration credentials secure. New passwords must be at least 8 characters.
        </p>

        {error ? (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-dim">Current password</span>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-ink border border-line px-3 py-2.5 pr-10 rounded-lg text-sm text-text outline-none focus:border-accent transition-colors"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-dim">New password</span>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full bg-ink border border-line px-3 py-2.5 pr-10 rounded-lg text-sm text-text outline-none focus:border-accent transition-colors"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-dim">Confirm new password</span>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-type new password"
              className="w-full bg-ink border border-line px-3 py-2.5 pr-10 rounded-lg text-sm text-text outline-none focus:border-accent transition-colors"
            />
          </div>
        </label>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="showPassToggle"
            checked={showPass}
            onChange={(e) => setShowPass(e.target.checked)}
            className="rounded border-line text-accent focus:ring-accent"
          />
          <label htmlFor="showPassToggle" className="text-xs text-dim select-none cursor-pointer">
            Show passwords
          </label>
        </div>
      </form>
    </Dialog>
  );
};

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

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
      <button
        onClick={() => {
          setMenuOpen(false);
          setChangePasswordOpen(true);
        }}
        className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm text-dim hover:text-text hover:bg-raised/40 rounded-lg transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Change password
      </button>
      <a href="/" target="_blank" rel="noreferrer" className="block px-3 py-2 text-sm text-dim hover:text-text hover:bg-raised/40 rounded-lg transition-colors">
        View site ↗
      </a>
      <button
        onClick={signOut}
        className="w-full text-left px-3 py-2 text-sm text-dim hover:text-text hover:bg-raised/40 rounded-lg transition-colors"
      >
        Sign out
      </button>
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
          <Suspense fallback={<SkeletonPage />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};
