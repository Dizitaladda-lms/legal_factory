import { lazy, Suspense, useState } from "react";
import api from "../../lib/api";

const AdminBlogs = lazy(() => import("./AdminBlogs"));

function hasSeoSession() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return ["seo_admin", "admin"].includes(payload.role) && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function SeoPortal() {
  const [authenticated, setAuthenticated] = useState(hasSeoSession);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authenticated) {
    return (
      <Suspense fallback={<div className="min-h-screen grid place-items-center font-bold text-slate-500">Loading SEO portal...</div>}>
        <AdminBlogs />
      </Suspense>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/api/blogs/seo-login", { id, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setAuthenticated(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">Dizital Adda</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">SEO Portal Login</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage SEO articles and publishing.</p>

        <label className="mt-7 block text-sm font-bold text-slate-700" htmlFor="seo-login-id">Login ID</label>
        <input id="seo-login-id" autoComplete="username" value={id} onChange={(event) => setId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" required />

        <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="seo-login-password">Password</label>
        <input id="seo-login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" required />

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-bold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
