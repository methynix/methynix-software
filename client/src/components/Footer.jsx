import { Link } from "react-router-dom";
import { SITE } from "../constants/site";

const year = new Date().getFullYear();

export const Footer = () => (
  <footer className="border-t border-line mt-24">
    <div className="max-w-page mx-auto px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
      <div className="md:col-span-5">
        <div className="flex items-center gap-2.5 mb-4">
          <img src="/logo.png" alt="" className="h-8 w-8 rounded-full object-contain" />
          <span className="font-display text-lg font-semibold">{SITE.fullName}</span>
        </div>
        <p className="text-dim text-sm leading-relaxed max-w-xs">
          We build websites, mobile apps and desktop software for businesses in Tanzania and beyond.
        </p>
      </div>

      <div className="md:col-span-3">
        <p className="eyebrow mb-4">Pages</p>
        <div className="flex flex-col gap-2.5 text-sm text-dim">
          <Link to="/work" className="hover:text-text transition-colors w-fit">Work</Link>
          <Link to="/services" className="hover:text-text transition-colors w-fit">Services</Link>
          <Link to="/about" className="hover:text-text transition-colors w-fit">About</Link>
          <Link to="/whats-new" className="hover:text-text transition-colors w-fit">What's new</Link>
          <Link to="/contact" className="hover:text-text transition-colors w-fit">Contact</Link>
        <Link to="/terms" className="hover:text-text transition-colors w-fit">Terms</Link>
<Link to="/privacy" className="hover:text-text transition-colors w-fit">Privacy</Link>
        </div>
      </div>

      <div className="md:col-span-4">
        <p className="eyebrow mb-4">Get in touch</p>
        <div className="flex flex-col gap-2.5 text-sm text-dim">
          <a href={`mailto:${SITE.email}`} className="hover:text-text transition-colors w-fit">{SITE.email}</a>
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-text transition-colors w-fit">{SITE.phone}</a>
          <span>{SITE.city}</span>
        </div>
      </div>
    </div>

    <div className="max-w-page mx-auto px-5 md:px-8 py-6 border-t border-line flex flex-col sm:flex-row gap-2 justify-between text-xs text-faint">
      <span>© {year} {SITE.fullName}</span>
      <Link to="/admin" className="hover:text-dim transition-colors w-fit">Staff login</Link>
    </div>
  </footer>
);
