import { useState } from "react";
import apiClient from "../api/apiClient";
import { useUI } from "../context/UIContext";
import { Input } from "../components/ui/Input";
import { SITE } from "../constants/site";

const NEEDS = [
  "Website",
  "Online store",
  "Mobile app",
  "Desktop software",
  "Animation",
  "Not sure yet",
];

const emptyForm = { name: "", email: "", phone: "", need: NEEDS[0], message: "" };

export const Contact = () => {
  const { showToast } = useUI();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) e.name = "Please tell us your name.";
    if (!emailRe.test(form.email)) e.email = "Please enter a valid email address.";
    if (form.phone && !/^[\d\s+\-()]{7,20}$/.test(form.phone))
      e.phone = "That phone number does not look right.";
    if (form.message.trim().length < 15)
      e.message = "A little more detail helps us reply well (at least 15 characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiClient.post("/contact", form);
      setSent(true);
      setForm(emptyForm);
      showToast("Message sent. We will get back to you.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const waText = encodeURIComponent("Hello Methynix, I would like to talk about a project.");

  return (
    <div className="max-w-page mx-auto px-5 md:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5">
        <p className="eyebrow mb-5">Contact</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          Start a project
        </h1>
        <p className="mt-6 text-lg text-dim leading-relaxed">
          Tell us what you need. You do not have to know the technical details —
          just describe the problem. We usually reply within a day.
        </p>

        <div className="mt-10 space-y-4 text-sm">
          <div>
            <p className="text-faint">Email</p>
            <a href={`mailto:${SITE.email}`} className="text-accent link-underline">{SITE.email}</a>
          </div>
          <div>
            <p className="text-faint">Phone</p>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="text-text">{SITE.phone}</a>
          </div>
          <div>
            <p className="text-faint">WhatsApp</p>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent link-underline"
            >
              Message us on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        {sent ? (
          <div className="rounded-2xl border border-accent/40 bg-surface p-8">
            <h2 className="font-display text-2xl font-semibold">Thanks — your message is on its way</h2>
            <p className="text-dim mt-3 leading-relaxed">
              We have received your message and will reply to the email you gave.
              If it is urgent, call or message us on WhatsApp.
            </p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm text-accent link-underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Your name" placeholder="Method Methynix" value={form.name} onChange={set("name")} error={errors.name} />
              <Input label="Email" type="email" placeholder="you@domain.com" value={form.email} onChange={set("email")} error={errors.email} />
            </div>
            <Input label="Phone (optional)" type="tel" placeholder="0 XXX XXX XXX" value={form.phone} onChange={set("phone")} error={errors.phone} />

            <label className="flex flex-col gap-2 w-full">
              <span className="text-xs font-medium text-dim">What do you need?</span>
              <select
                value={form.need}
                onChange={set("need")}
                className="bg-ink border border-line p-3.5 rounded-lg text-text outline-none focus:border-accent transition-colors"
              >
                {NEEDS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>

            <Input
              label="Tell us about it"
              type="textarea"
              placeholder="What are you trying to build or fix? Who is it for?"
              value={form.message}
              onChange={set("message")}
              error={errors.message}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
