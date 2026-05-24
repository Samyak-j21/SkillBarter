import { API_BASE_URL } from "../config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(data));
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg-page flex items-center justify-center p-4 md:p-10 transition-colors duration-300 overflow-y-auto">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center py-8">
        
        {/* LEFT: Premium Features Showcase Panel */}
        <div className="flex-1 max-w-2xl text-left space-y-8 animate-fade-in order-2 lg:order-1 hidden md:block">
          <div className="space-y-4">
            <span className="bg-blue-600/10 dark:bg-blue-600/5 text-blue-600 dark:text-blue-400 border border-blue-600/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
              SkillBarter Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-black theme-text-primary tracking-tight leading-none">
              Barter your skills, <br/>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                elevate your craft.
              </span>
            </h1>
            <p className="theme-text-secondary text-sm md:text-md font-medium leading-relaxed max-w-lg">
              Exchange software development expertise, creative designs, digital marketing, music, and foreign languages directly. Let's make peer learning social, objective, and fair.
            </p>
          </div>

          {/* Dual Track Infinite Vertical Marquees */}
          <div className="h-[420px] overflow-hidden relative marquee-hover-pause grid grid-cols-2 gap-4 w-full pt-4">
            
            {/* Column 1: Scrolls Up */}
            <div className="relative h-full overflow-hidden flex flex-col">
              <div className="flex flex-col gap-4 animate-scroll-up">
                {[
                  {
                    title: "Cosine Similarity Scoring",
                    desc: "Dynamic compatible matches using our smart vectors mathematical scoring.",
                    svg: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  },
                  {
                    title: "Fair Level Assessment",
                    desc: "Locks in objective skill grades derived from practice duration & project scale.",
                    svg: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17m9-9H3" /></svg>
                  },
                  {
                    title: "Dynamic Categorization",
                    desc: "Sleek Technology vs. Hobbies skill portfolios classified instantly.",
                    svg: <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  },
                  {
                    title: "Interactive Swaps & Chat",
                    desc: "Discuss exchange parameters and propose barter contracts inside active feeds.",
                    svg: <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  }
                ].concat([
                  {
                    title: "Cosine Similarity Scoring",
                    desc: "Dynamic compatible matches using our smart vectors mathematical scoring.",
                    svg: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  },
                  {
                    title: "Fair Level Assessment",
                    desc: "Locks in objective skill grades derived from practice duration & project scale.",
                    svg: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17m9-9H3" /></svg>
                  },
                  {
                    title: "Dynamic Categorization",
                    desc: "Sleek Technology vs. Hobbies skill portfolios classified instantly.",
                    svg: <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  },
                  {
                    title: "Interactive Swaps & Chat",
                    desc: "Discuss exchange parameters and propose barter contracts inside active feeds.",
                    svg: <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  }
                ]).map((f, idx) => (
                  <div 
                    key={idx}
                    className="theme-bg-card p-5 rounded-3xl border theme-border hover:border-blue-500 transition-all duration-300 group flex items-start gap-4 shrink-0 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-900 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {f.svg}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs theme-text-primary group-hover:text-blue-600 transition-colors uppercase tracking-wider leading-tight">{f.title}</h4>
                      <p className="text-[10px] theme-text-secondary font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Scrolls Down */}
            <div className="relative h-full overflow-hidden flex flex-col">
              <div className="flex flex-col gap-4 animate-scroll-down">
                {[
                  {
                    title: "Custom Payments",
                    desc: "Set custom adjustments or cash balance offsets directly in proposals.",
                    svg: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  },
                  {
                    title: "Live Status Tracking",
                    desc: "Tracks proposal status indicators instantly when trades are updated.",
                    svg: <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  },
                  {
                    title: "Reddit Forum Hubs",
                    desc: "Reddit-style community boards to share threads, success logs, and upvotes.",
                    svg: <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  },
                  {
                    title: "Premium Visual System",
                    desc: "Jaw-dropping premium aesthetics with glass cards and soft light modes.",
                    svg: <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.01-2.512a1.593 1.593 0 01-.855-1.115 2.25 2.25 0 01-1.99-2.228A4.5 4.5 0 002.25 9c0 1.38.62 2.618 1.6 3.447m.893 1.89c.77 0 1.432-.483 1.688-1.16a2.25 2.25 0 012.245-1.4 4.5 4.5 0 00-2.245-7.5" /></svg>
                  }
                ].concat([
                  {
                    title: "Custom Payments",
                    desc: "Set custom adjustments or cash balance offsets directly in proposals.",
                    svg: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  },
                  {
                    title: "Live Status Tracking",
                    desc: "Tracks proposal status indicators instantly when trades are updated.",
                    svg: <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  },
                  {
                    title: "Reddit Forum Hubs",
                    desc: "Reddit-style community boards to share threads, success logs, and upvotes.",
                    svg: <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  },
                  {
                    title: "Premium Visual System",
                    desc: "Jaw-dropping premium aesthetics with glass cards and soft light modes.",
                    svg: <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.01-2.512a1.593 1.593 0 01-.855-1.115 2.25 2.25 0 01-1.99-2.228A4.5 4.5 0 002.25 9c0 1.38.62 2.618 1.6 3.447m.893 1.89c.77 0 1.432-.483 1.688-1.16a2.25 2.25 0 012.245-1.4 4.5 4.5 0 00-2.245-7.5" /></svg>
                  }
                ]).map((f, idx) => (
                  <div 
                    key={idx}
                    className="theme-bg-card p-5 rounded-3xl border theme-border hover:border-blue-500 transition-all duration-300 group flex items-start gap-4 shrink-0 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-900 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {f.svg}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs theme-text-primary group-hover:text-blue-600 transition-colors uppercase tracking-wider leading-tight">{f.title}</h4>
                      <p className="text-[10px] theme-text-secondary font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: Login Card */}
        <div className="w-full max-w-md theme-bg-card rounded-[3rem] p-10 md:p-12 border theme-border shadow-2xl shadow-neutral-200/40 dark:shadow-none transition-all order-1 lg:order-2">
          <div className="text-center mb-10">
            <div 
              className="w-20 h-20 bg-neutral-900 dark:bg-white rounded-[2rem] mx-auto flex items-center justify-center text-white dark:text-neutral-900 text-4xl font-black mb-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate("/")}
            >
              S
            </div>
            <h1 className="text-4xl font-black theme-text-primary tracking-tighter">Welcome back</h1>
            <p className="theme-text-muted mt-3 font-medium uppercase text-[10px] tracking-widest">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 px-5 py-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-xs font-semibold leading-relaxed">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-10 theme-text-secondary text-xs font-medium">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="theme-accent font-black uppercase tracking-widest hover:underline"
              disabled={loading}
            >
              Sign up
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}