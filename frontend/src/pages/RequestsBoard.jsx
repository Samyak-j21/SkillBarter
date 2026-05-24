import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RequestsBoard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Post form state
  const [needSkill, setNeedSkill] = useState("");
  const [needLevel, setNeedLevel] = useState("Easy");
  const [needCategory, setNeedCategory] = useState("Technology");
  const [offerSkill, setOfferSkill] = useState("");
  const [offerLevel, setOfferLevel] = useState("Easy");
  const [offerCategory, setOfferCategory] = useState("Technology");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Technology", "Design", "Marketing", "Music", "Languages", "Photography", "Business"];

  const getCategoryColor = (category) => {
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
    try {
      const saved = localStorage.getItem("user");
      if (!saved) {
        navigate("/");
        return;
      }
      const data = JSON.parse(saved);
      setCurrentUser(data);
      fetchRequests();
    } catch (e) {
      navigate("/");
    }
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`);
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      }
    } catch (e) {
      console.error("Failed to load requests board feed:", e);
      setError("Failed to load skills requests board feed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!currentUser || submitting) return;

    if (!needSkill.trim() || !offerSkill.trim() || !description.trim()) {
      setError("Please enter all details including need, offering, and description.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/requests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUser.email,
          userName: currentUser.name,
          needSkill: needSkill.trim(),
          needLevel,
          needCategory,
          offerSkill: offerSkill.trim(),
          offerLevel,
          offerCategory,
          description: description.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Skill request posted successfully!");
        setRequests(prev => [data, ...prev]);
        // Reset form
        setNeedSkill("");
        setOfferSkill("");
        setDescription("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to post request.");
      }
    } catch (err) {
      setError("Something went wrong posting your request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposeTrade = (req) => {
    // Navigate to Chat page with trade candidate hydrated in state
    const candidate = {
      email: req.userEmail,
      name: req.userName,
      offer: [{ skill: req.offerSkill, level: req.offerLevel, category: req.offerCategory }],
      want: [{ skill: req.needSkill, level: req.needLevel, category: req.needCategory }]
    };
    navigate("/chat", { state: { selectedUser: candidate } });
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.needSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.offerSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    
    if (activeCategory === "All") return true;
    return req.needCategory === activeCategory || req.offerCategory === activeCategory;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen theme-bg-page transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-in">
        <header className="mb-12">
          <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
            Platform Bulletin Board
          </span>
          <h1 className="text-5xl font-black theme-text-primary tracking-tight">
            Skills Request Board
          </h1>
          <p className="text-xl theme-text-secondary mt-3 font-medium max-w-xl">
            Browse open exchange requests posted by members, or publish your own needs to trigger instant barter matching.
          </p>
        </header>

        {error && (
          <div className="mb-8 px-6 py-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-3xl text-red-500 text-sm font-semibold">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="mb-8 px-6 py-4 bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 rounded-3xl text-green-500 text-sm font-semibold">
            Success: {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* LEFT: Open Requests List Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests by skill or name..."
                className="w-full md:max-w-sm px-5 py-3.5 rounded-2xl border theme-border theme-bg-card theme-text-primary outline-none focus:border-blue-600 transition-all text-xs font-bold"
              />
              
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                    activeCategory === "All"
                      ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "theme-bg-card theme-border theme-text-secondary"
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 4).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                      activeCategory === cat
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "theme-bg-card theme-border theme-text-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(n => (
                  <div key={n} className="h-48 theme-bg-card rounded-[2rem] border theme-border animate-pulse shadow-sm"></div>
                ))}
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-6">
                {filteredRequests.map(req => {
                  const isOwnRequest = req.userEmail.toLowerCase() === currentUser.email.toLowerCase();
                  return (
                    <div 
                      key={req.id}
                      className="theme-bg-card rounded-[2.5rem] p-8 border theme-border shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-bold theme-text-primary">{req.userName}</h4>
                            <span className="text-[9px] theme-text-muted font-bold block mt-1">{req.dateStr}</span>
                          </div>
                          
                          {isOwnRequest && (
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 theme-text-secondary border theme-border">
                              My Post
                            </span>
                          )}
                        </div>

                        {/* Swap Matrix grid */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="theme-bg-page p-4 rounded-2xl border theme-border flex flex-col justify-between">
                            <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-1">Needs</span>
                            <h5 className="font-black theme-text-primary text-sm">{req.needSkill}</h5>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${getCategoryColor(req.needCategory)}`}>
                                {req.needCategory}
                              </span>
                              <span className="text-[8px] theme-text-secondary font-black uppercase">Level: {req.needLevel}</span>
                            </div>
                          </div>
                          
                          <div className="theme-bg-page p-4 rounded-2xl border theme-border flex flex-col justify-between">
                            <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-1">Offering</span>
                            <h5 className="font-black theme-text-primary text-sm">{req.offerSkill}</h5>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${getCategoryColor(req.offerCategory)}`}>
                                {req.offerCategory}
                              </span>
                              <span className="text-[8px] theme-text-secondary font-black uppercase">Level: {req.offerLevel}</span>
                            </div>
                          </div>
                        </div>

                        {/* Request Description */}
                        <p className="theme-text-secondary text-xs leading-relaxed font-semibold">
                          {req.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t theme-border flex justify-end">
                        {!isOwnRequest ? (
                          <button
                            onClick={() => handleProposeTrade(req)}
                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-blue-600 hover:text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md"
                          >
                            Propose Barter
                          </button>
                        ) : (
                          <span className="text-[10px] theme-text-muted font-bold italic">Awaiting proposals from other members.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="theme-bg-card rounded-[2.5rem] py-16 px-8 text-center border theme-border">
                <p className="theme-text-muted text-sm font-semibold italic">No active matching requests found.</p>
              </div>
            )}
          </div>

          {/* RIGHT: Post a Request Form */}
          <div>
            <div className="theme-bg-card rounded-[2.5rem] p-8 border theme-border shadow-sm sticky top-24">
              <h3 className="text-xl font-black theme-text-primary tracking-tight mb-2">
                Post open request
              </h3>
              <p className="theme-text-secondary text-xs font-semibold leading-relaxed mb-6">
                Publish what you offer and what you need. Other members can see this and propose deals directly.
              </p>

              <form onSubmit={handlePostRequest} className="space-y-5">
                {/* Need Skill details */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">What you need</label>
                  <input
                    value={needSkill}
                    onChange={(e) => setNeedSkill(e.target.value)}
                    placeholder="Skill name (e.g. JavaScript, Guitar)"
                    className="w-full px-4 py-3 rounded-xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-semibold text-xs"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <select
                      value={needCategory}
                      onChange={(e) => setNeedCategory(e.target.value)}
                      className="px-2 py-2 rounded-lg border theme-border theme-bg-page theme-text-secondary text-[10px] font-bold outline-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={needLevel}
                      onChange={(e) => setNeedLevel(e.target.value)}
                      className="px-2 py-2 rounded-lg border theme-border theme-bg-page theme-text-secondary text-[10px] font-bold outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Offer Skill details */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">What you offer in return</label>
                  <input
                    value={offerSkill}
                    onChange={(e) => setOfferSkill(e.target.value)}
                    placeholder="Skill name (e.g. Python, Figma)"
                    className="w-full px-4 py-3 rounded-xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-semibold text-xs"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <select
                      value={offerCategory}
                      onChange={(e) => setOfferCategory(e.target.value)}
                      className="px-2 py-2 rounded-lg border theme-border theme-bg-page theme-text-secondary text-[10px] font-bold outline-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={offerLevel}
                      onChange={(e) => setOfferLevel(e.target.value)}
                      className="px-2 py-2 rounded-lg border theme-border theme-bg-page theme-text-secondary text-[10px] font-bold outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Description details */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">Describe exchange goals</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what projects you want to build or how many sessions you'd like to barter..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-semibold text-xs resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !needSkill || !offerSkill}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl shadow-blue-500/15 disabled:opacity-40"
                >
                  {submitting ? "Publishing..." : "Publish Request"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
