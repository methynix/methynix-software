import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { SITE } from "../../constants/site";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.post("/admin/login", form);
      login(res.data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-full object-contain" />
          <span className="font-display text-xl font-semibold">{SITE.name}</span>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-7">
          <h1 className="font-display text-2xl font-semibold">Staff login</h1>
          <p className="text-dim text-sm mt-1">Sign in to manage the site.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@methynix.com" />
            <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-accent text-accentInk font-medium hover:bg-accentDeep hover:text-text transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
