import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import apiClient from "./api/apiClient";
import { SkeletonDashboardShell } from "./components/ui/Skeleton";
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
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";

// The staff dashboard (and its PDF tooling) loads only after sign-in, so
// public visitors never download it.
const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const AdminLayout = named(() => import("./pages/admin/AdminLayout"), "AdminLayout");
const Overview = named(() => import("./pages/admin/Overview"), "Overview");
const Clients = named(() => import("./pages/admin/Clients"), "Clients");
const ClientDetail = named(() => import("./pages/admin/ClientDetail"), "ClientDetail");
const Reminders = named(() => import("./pages/admin/Reminders"), "Reminders");
const Finance = named(() => import("./pages/admin/Finance"), "Finance");
const Projects = named(() => import("./pages/admin/Projects"), "Projects");
const Infrastructure = named(() => import("./pages/admin/Infrastructure"), "Infrastructure");
const Documents = named(() => import("./pages/admin/Documents"), "Documents");
const Notes = named(() => import("./pages/admin/Notes"), "Notes");
const Website = named(() => import("./pages/admin/Website"), "Website");


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

  useEffect(() => {
    // Check maintenance in the background. We never block the first paint on
    // this — the site renders immediately and only flips to the maintenance
    // page if the backend actually reports maintenance is on.
    apiClient
      .get("/site/status")
      .then((r) => setMaintenance(Boolean(r.data.maintenance)))
      .catch(() => setMaintenance(false));
  }, []);

  const isAdmin = pathname.startsWith("/admin");

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
        <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
<Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
        <Route path="/admin" element={<AdminGate />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <Suspense fallback={<SkeletonDashboardShell />}>
                <AdminLayout />
              </Suspense>
            </RequireAuth>
          }
        >
          <Route index element={<Overview />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="finance" element={<Finance />} />
          <Route path="projects" element={<Projects />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="documents" element={<Documents />} />
          <Route path="notes" element={<Notes />} />
          <Route path="website" element={<Website />} />
        </Route>
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
