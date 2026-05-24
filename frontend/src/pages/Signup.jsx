import { API_BASE_URL } from "../config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all registration fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Save user session in localStorage
      localStorage.setItem("user", JSON.stringify(data));
      
      // Redirect to profile setup first!
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg-page flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md theme-bg-card rounded-[3rem] p-12 border theme-border shadow-2xl shadow-neutral-200/50 dark:shadow-none transition-all">
        <div className="text-center mb-10">
          <div 
            className="w-20 h-20 bg-neutral-900 dark:bg-white rounded-[2rem] mx-auto flex items-center justify-center text-white dark:text-neutral-900 text-4xl font-black mb-6 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/")}
          >
            S
          </div>
          <h1 className="text-4xl font-black theme-text-primary tracking-tighter">Create account</h1>
          <p className="theme-text-muted mt-3 font-medium uppercase text-[10px] tracking-widest">Join the skill barter community</p>
        </div>

        {error && (
          <div className="mb-6 px-5 py-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-xs font-semibold leading-relaxed">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-6 py-4 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-bold placeholder:text-neutral-300"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-6 py-4 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-bold placeholder:text-neutral-300"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-bold placeholder:text-neutral-300"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-blue-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center mt-10 theme-text-secondary text-xs font-medium">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/")}
            className="theme-accent font-black uppercase tracking-widest hover:underline"
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}