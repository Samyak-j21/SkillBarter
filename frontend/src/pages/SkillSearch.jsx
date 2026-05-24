import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SkillSearch() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const getSkillCategoryColor = (category) => {
    switch (category) {
      case "Technology": return "text-blue-600 bg-blue-600/5 border-blue-600/10";
      case "Design": return "text-purple-600 bg-purple-600/5 border-purple-600/10";
      case "Marketing": return "text-emerald-600 bg-emerald-600/5 border-emerald-600/10";
      case "Music": return "text-pink-600 bg-pink-600/5 border-pink-600/10";
      case "Languages": return "text-amber-600 bg-amber-600/5 border-amber-600/10";
      case "Photography": return "text-cyan-600 bg-cyan-600/5 border-cyan-600/10";
      case "Business": return "text-indigo-600 bg-indigo-600/5 border-indigo-600/10";
      default: return "text-neutral-600 bg-neutral-600/5 border-neutral-600/10";
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (!data) {
      navigate("/");
      return;
    }
    setCurrentUser(data);
    fetchUsers(data.email);
  }, []);

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

  const fetchUsers = async (excludeEmail) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:5000/api/users?exclude=${encodeURIComponent(excludeEmail)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }
      
      const normalizedUsers = data.map(u => ({
        ...u,
        offer: normalizeSkills(u.offer),
        want: normalizeSkills(u.want)
      }));
      
      setUsers(normalizedUsers);
    } catch (err) {
      setError(err.message || "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesQuery = 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.offer.some(item => item.skill.toLowerCase().includes(query.toLowerCase())) ||
      user.want.some(item => item.skill.toLowerCase().includes(query.toLowerCase()));
      
    if (!matchesQuery) return false;
    
    if (activeCategory === "All") return true;
    return user.offer.some(item => {
      const cat = getSkillCategory(item);
      return cat && cat.toLowerCase() === activeCategory.toLowerCase();
    });
  });

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case "Easy": return "bg-green-100/50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/20";
      case "Medium": return "bg-blue-100/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/20";
      case "Advanced": return "bg-purple-100/50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/20";
      default: return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600";
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Top Mentor": return "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
      case "Trusted Trader": return "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
      case "Skill Maestro": return "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/20";
      default: return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <div className="min-h-screen theme-bg-page transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <header className="mb-16 text-center animate-fade-in">
          <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
            Members Directory
          </span>
          <h1 className="text-6xl font-black theme-text-primary tracking-tighter mb-4">
            Explore Skills
          </h1>
          <p className="text-xl theme-text-secondary max-w-2xl mx-auto font-medium">
            Find registered developers, creatives, and experts. Connect and exchange your skills.
          </p>

          <div className="mt-10 max-w-2xl mx-auto relative group">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users or skills (e.g. 'React', 'Python', 'Rahul')..."
              className="w-full theme-bg-card border theme-border rounded-[2rem] px-10 py-6 shadow-2xl shadow-neutral-200/30 dark:shadow-none outline-none focus:border-blue-600 transition-all text-lg font-bold theme-text-primary placeholder:text-neutral-300"
            />
          </div>

          <div className="mt-8 flex justify-center gap-2.5 flex-wrap max-w-4xl mx-auto">
            {["All", "Technology", "Design", "Marketing", "Music", "Languages", "Photography", "Business"].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-wider border transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "theme-bg-card theme-border theme-text-secondary hover:theme-text-primary"
                }`}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </header>

        {error && (
          <div className="mb-8 px-6 py-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-3xl text-red-500 text-sm font-semibold">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((n) => (
              <div key={n} className="theme-bg-card rounded-[2.5rem] p-8 border theme-border animate-pulse h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredUsers.map(user => (
              <div key={user.email} className="theme-bg-card rounded-[2.5rem] p-8 border theme-border hover:scale-[1.02] hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-neutral-200/30 dark:hover:shadow-none flex flex-col justify-between min-h-[480px]">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {user.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-black theme-text-primary leading-tight">{user.name}</h3>
                        <span className="text-[9px] theme-text-muted font-bold block mt-0.5">{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-amber-500 font-bold text-xs gap-0.5 bg-neutral-100 dark:bg-neutral-900 border theme-border px-2.5 py-1 rounded-full">
                      ★ <span>{user.rating?.toFixed(1) || "5.0"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      {user.completedExchanges || 0} Completed Swaps
                    </span>
                  </div>

                  {/* Badges List */}
                  {user.badges && user.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.badges.map(b => (
                        <span key={b} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${getBadgeColor(b)}`}>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="theme-text-secondary text-xs mb-6 leading-relaxed line-clamp-2 min-h-[2rem]">{user.bio || "No bio details added yet."}</p>

                  {/* Skills lists */}
                  <div className="mb-6 space-y-4">
                    <div>
                      <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-2">Skills Offered</span>
                      <div className="flex flex-wrap gap-1">
                        {user.offer && user.offer.length > 0 ? (
                          user.offer.map(item => {
                            const cat = getSkillCategory(item);
                            return (
                              <span key={item.skill} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 ${getSkillCategoryColor(cat)}`}>
                                <span>{item.skill}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[7px] font-black ${getLevelBadgeColor(item.level)}`}>
                                  {item.level ? item.level[0] : "?"}
                                </span>
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] theme-text-muted font-medium italic">None listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/chat", { state: { selectedUser: user } })}
                  className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-600 dark:hover:bg-neutral-200 active:scale-95 shadow-md shadow-neutral-900/10 dark:shadow-none mt-4"
                >
                  Chat & Propose Barter
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-20 theme-bg-card rounded-[3rem] border theme-border">
            <p className="theme-text-muted text-lg font-black uppercase tracking-widest">No users found matching "{query}"</p>
          </div>
        )}
      </main>
    </div>
  );
}