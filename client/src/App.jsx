import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import apiClient from "./api/apiClient";
import { UIProvider } from "./context/UIContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Services } from "./pages/Services";
import { Work } from "./pages/Work";
import { About } from "./pages/About";
import { WhatsNew } from "./pages/WhatsNew";
import { Contact } from "./pages/Contact";
import { Maintenance } from "./pages/Maintenance";
import { Login } from "./pages/admin/Login";
import { Dashboard } from "./pages/admin/Dashboard";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const RequireAuth = ({ children }) => {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/admin" replace />;
};

const AdminGate = () => {
  const { isAuthed } = useAuth();
  return isAuthed ? <Navigate to="/admin/dashboard" replace /> : <Login />;
};

const NotFound = () => (
  <div className="max-w-page mx-auto px-5 md:px-8 py-28 text-center">
    <p className="eyebrow mb-4">Page not found</p>
    <h1 className="font-display text-4xl font-semibold">This page does not exist</h1>
  </div>
);

const Shell = () => {
  const { pathname } = useLocation();
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiClient
      .get("/site/status")
      .then((r) => setMaintenance(Boolean(r.data.maintenance)))
      .catch(() => setMaintenance(false))
      .finally(() => setChecked(true));
  }, []);

  const isAdmin = pathname.startsWith("/admin");

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center text-dim">Loading…</div>;
  }

  if (maintenance && !isAdmin) {
    return <Maintenance />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/work" element={<PublicLayout><Work /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/whats-new" element={<PublicLayout><WhatsNew /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/admin" element={<AdminGate />} />
        <Route path="/admin/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
