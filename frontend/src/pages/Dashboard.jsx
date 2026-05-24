import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wizardStep, setWizardStep] = useState(0);
  const navigate = useNavigate();

  const getSkillCategory = (item) => {
    if (item && item.category) {
      if (item.category === "Technical") return "Technology";
      if (item.category === "Non-Technical") return "Design";
      return item.category;
    }
    
    const nameLower = (item.skill || "").toLowerCase();
    const presets = {
      "html": "Technology", "css": "Technology", "javascript": "Technology", "python": "Technology",
      "c++": "Technology", "react": "Technology", "node.js": "Technology", "node": "Technology",
      "algorithms": "Technology", "data science": "Technology", "typescript": "Technology",
      "figma": "Design", "ui/ux": "Design", "design": "Design",
      "marketing": "Marketing", "seo": "Marketing",
      "guitar": "Music", "piano": "Music", "singing": "Music",
      "french": "Languages", "spanish": "Languages", "english": "Languages",
      "photography": "Photography",
      "public speaking": "Business", "writing": "Business"
    };
    
    if (presets[nameLower]) return presets[nameLower];
    
    const techKeywords = ["html", "css", "js", "java", "python", "c++", "react", "node", "sql", "data", "programming", "dev", "code", "git"];
    if (techKeywords.some(kw => nameLower.includes(kw))) {
      return "Technology";
    }
    return "Design";
  };

  const getSkillColorClass = (item) => {
    const cat = getSkillCategory(item);
    switch (cat) {
      case "Technology": return "bg-blue-600";
      case "Design": return "bg-purple-600";
      case "Marketing": return "bg-emerald-600";
      case "Music": return "bg-pink-600";
      case "Languages": return "bg-amber-600";
      case "Photography": return "bg-cyan-600";
      case "Business": return "bg-indigo-600";
      default: return "bg-neutral-600";
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Top Mentor": return "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
      case "Trusted Trader": return "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
      case "Skill Maestro": return "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20";
      default: return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20";
    }
  };

  const normalizeSkills = (skillsArray) => {
    if (!skillsArray) return [];
    return skillsArray.map(item => {
      if (typeof item === 'string') return { skill: item, level: 'Easy' };
      if (item && typeof item === 'object' && item.skill) {
        return { skill: item.skill, level: item.level || 'Medium', category: item.category };
      }
      return null;
    }).filter(Boolean);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined" || raw === "null") {
        localStorage.removeItem("user");
        navigate("/");
        return;
      }
      const data = JSON.parse(raw);
      if (!data || !data.email) {
        localStorage.removeItem("user");
        navigate("/");
        return;
      }
      
      const normalizedUser = {
        ...data,
        offer: normalizeSkills(data.offer),
        want: normalizeSkills(data.want)
      };
      
      setUser(normalizedUser);
      fetchMatches(normalizedUser.email);
    } catch (e) {
      localStorage.removeItem("user");
      navigate("/");
    }
  }, []);

  const fetchMatches = async (email) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`https://skillbarter-05s6.onrender.com/api/users/matches?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404 || data.error === "User not found") {
          localStorage.removeItem("user");
          navigate("/");
          return;
        }
        throw new Error(data.error || "Failed to fetch matches");
      }
      
      const normalizedMatches = data.map(m => ({
        ...m,
        offer: normalizeSkills(m.offer),
        want: normalizeSkills(m.want)
      }));
      
      setMatches(normalizedMatches);
    } catch (err) {
      setError(err.message || "Something went wrong loading matches.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen theme-bg-page transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in space-y-8 sm:space-y-10">
        
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b theme-border">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
              Welcome, {user.name}!
            </h1>
            <p className="text-sm sm:text-base theme-text-secondary mt-1 font-semibold">
              Manage your trades and explore dynamic compatible matches.
            </p>
          </div>
        </header>

        {error && (
          <div className="px-6 py-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-[2rem] text-red-500 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Dynamic Command Center Side-By-Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: User Hub, Skill Portfolios & Onboarding Wizard */}
          <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
            
            {/* Quick Profile Summary Card */}
            <div className="theme-bg-card p-6 sm:p-8 rounded-[2.5rem] border theme-border shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                {user.name[0]}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black theme-text-primary leading-tight truncate">{user.name}</h3>
                <span className="text-[10px] theme-text-muted font-bold block mt-1">
                  ⭐ {user.rating?.toFixed(1) || "5.0"} Exchange Rating
                </span>
                {user.badges && user.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.badges.slice(0, 2).map(b => (
                      <span key={b} className="px-2 py-0.5 rounded text-[7px] font-black uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/15">
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Skills Portfolio Card */}
            <div className="theme-bg-card p-6 sm:p-8 rounded-[2.5rem] border theme-border shadow-sm space-y-6">
              <div>
                <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-3">
                  My Teaching ({user.offer?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {user.offer && user.offer.length > 0 ? (
                    user.offer.map(item => (
                      <span key={item.skill} className="theme-bg-page px-3 py-1.5 rounded-xl text-xs font-bold border theme-border theme-text-secondary flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${getSkillColorClass(item)} shrink-0`}></span>
                        <span>{item.skill}</span>
                        <span className="text-[8px] opacity-60 font-black">({item.level ? item.level[0] : "?"})</span>
                      </span>
                    ))
                  ) : (
                    <span className="theme-text-muted text-xs font-semibold italic">None set yet</span>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-3">
                  My Learning ({user.want?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {user.want && user.want.length > 0 ? (
                    user.want.map(item => (
                      <span key={item.skill} className="theme-bg-page px-3 py-1.5 rounded-xl text-xs font-bold border theme-border theme-text-secondary flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${getSkillColorClass(item)} shrink-0`}></span>
                        <span>{item.skill}</span>
                        <span className="text-[8px] opacity-60 font-black">({item.level ? item.level[0] : "?"})</span>
                      </span>
                    ))
                  ) : (
                    <span className="theme-text-muted text-xs font-semibold italic">None set yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Onboarding Wizard: How it works */}
            <div className="theme-bg-card rounded-[2.5rem] p-6 sm:p-8 border theme-border shadow-sm space-y-6 md:col-span-2 lg:col-span-1">
              <div>
                <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-block mb-3">
                  Interactive Guide
                </span>
                <h3 className="text-lg font-black theme-text-primary tracking-tight">How It Works</h3>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { title: "1. Setup Profile", path: "/profile", desc: "List your teaching (offers) and learning (wants) skills with automatic difficulty evaluation." },
                  { title: "2. Discover Partners", path: "/match", desc: "Browse your cosine suggested match directory, post on Request Board or swipe Tinder Deck feeds." },
                  { title: "3. Propose Deals", path: "/chat", desc: "Propose barter contracts inside chats. Configure skills swap and custom compensations manually." }
                ].map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setWizardStep(idx)}
                    className={`p-4 rounded-xl text-left border transition-all text-xs font-bold ${
                      wizardStep === idx
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                    }`}
                  >
                    <div className="uppercase tracking-wider text-[9px] mb-1">{step.title}</div>
                    {wizardStep === idx && (
                      <p className="text-[10px] leading-relaxed font-semibold mt-1.5 opacity-90 animate-fade-in">
                        {step.desc}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const paths = ["/profile", "/match", "/chat"];
                  navigate(paths[wizardStep]);
                }}
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-md"
              >
                {["Configure Profile", "Discover Feed Matches", "Inbox Chat Deals"][wizardStep]} &rarr;
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Suggested Matches Directory list */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black theme-text-primary flex items-center gap-3">
                Suggested Match Partners
                <span className="bg-neutral-200 dark:bg-neutral-800 theme-text-secondary text-xs px-3 py-1 rounded-full font-bold">
                  {matches.length}
                </span>
              </h2>
              <button 
                onClick={() => fetchMatches(user.email)} 
                className="text-[10px] theme-accent font-black uppercase tracking-widest hover:underline"
              >
                🔄 Refresh List
              </button>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                  <div key={n} className="theme-bg-card rounded-[2.5rem] p-8 border theme-border animate-pulse h-96 shadow-sm"></div>
                ))}
              </div>
            ) : matches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <div 
                    key={match.email}
                    className="group theme-bg-card rounded-[2.5rem] p-8 border theme-border hover:border-blue-500 hover:shadow-2xl hover:shadow-neutral-200/20 dark:hover:shadow-none transition-all duration-300 flex flex-col justify-between min-h-[480px]"
                  >
                    <div>
                      {/* Match Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                          {match.name[0]}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/20">
                            🎯 {match.score}% MATCH
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            match.matchType === "Mutual" 
                              ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20" 
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/20"
                          }`}>
                            {match.matchType}
                          </span>
                        </div>
                      </div>

                      {/* Name & Stars */}
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-xl font-black theme-text-primary tracking-tight">{match.name}</h3>
                        <div className="flex items-center text-amber-500 font-bold text-xs gap-0.5 bg-neutral-100 dark:bg-neutral-900 border theme-border px-2.5 py-0.5 rounded-full">
                          ★ <span>{match.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                          🤝 {match.completedExchanges || 0} Successful Swaps
                        </span>
                      </div>

                      {/* Achievements Badges */}
                      {match.badges && match.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-5">
                          {match.badges.map(b => (
                            <span 
                              key={b} 
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${getBadgeColor(b)}`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="theme-text-secondary text-xs mb-6 leading-relaxed line-clamp-2 min-h-[2rem]">{match.bio || "No bio added yet."}</p>

                      {/* Skills lists capsules with clean bullet dots */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-2">Can teach you</span>
                          <div className="flex flex-wrap gap-1.5">
                            {match.offer.map(item => (
                              <span key={item.skill} className="theme-bg-page px-2.5 py-1 rounded-lg text-[10px] font-bold border theme-border theme-text-secondary flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${getSkillColorClass(item)} shrink-0`}></span>
                                <span>{item.skill}</span>
                                <span className="text-[8px] opacity-60 font-black">({item.level ? item.level[0] : "?"})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-2">Wants to learn</span>
                          <div className="flex flex-wrap gap-1.5">
                            {match.want.map(item => (
                              <span key={item.skill} className="theme-bg-page px-2.5 py-1 rounded-lg text-[10px] font-bold border theme-border theme-text-secondary flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${getSkillColorClass(item)} shrink-0`}></span>
                                <span>{item.skill}</span>
                                <span className="text-[8px] opacity-60 font-black">({item.level ? item.level[0] : "?"})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/chat", { state: { selectedUser: match } })}
                      className="w-full bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-blue-600 dark:hover:bg-neutral-200 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md mt-4"
                    >
                      Connect & Chat
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="theme-bg-card py-20 rounded-[3rem] text-center border theme-border shadow-sm">
                <h3 className="text-xl font-bold theme-text-primary">No matches found yet</h3>
                <p className="theme-text-secondary max-w-xs mx-auto mt-2 text-xs font-semibold leading-relaxed">
                  Try expanding your offered skills or wanted interests inside your profile setup to calculate newer matching similarity vectors.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="mt-6 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-md"
                >
                  Update My Profile
                </button>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}