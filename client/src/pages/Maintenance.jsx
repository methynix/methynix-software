import { SITE } from "../constants/site";

export const Maintenance = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <img src="/logo-advanced.jpeg" alt="" className="h-16 w-16 rounded-full object-contain mb-8" />
    <p className="eyebrow mb-4">{SITE.fullName}</p>
    <h1 className="font-display text-3xl md:text-4xl font-semibold max-w-xl leading-tight">
      We are doing a bit of maintenance
    </h1>
    <p className="text-dim mt-5 max-w-md leading-relaxed">
      The site will be back shortly. If you need us in the meantime, email{" "}
      <a href={`mailto:${SITE.email}`} className="text-accent link-underline">{SITE.email}</a>{" "}
      or call {SITE.phone}.
    </p>
  </div>
);
