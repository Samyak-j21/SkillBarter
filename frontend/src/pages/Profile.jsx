import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [bio, setBio] = useState("");
  const [offer, setOffer] = useState([]);
  const [want, setWant] = useState([]);
  
  // Portfolios metrics
  const [rating, setRating] = useState(5.0);
  const [completedExchanges, setCompletedExchanges] = useState(0);
  const [badges, setBadges] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Peer review form state
  const [peers, setPeers] = useState([]);
  const [reviewTarget, setReviewTarget] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [skillsCatalog, setSkillsCatalog] = useState([]);
  
  const [selectedOfferSkill, setSelectedOfferSkill] = useState("");
  const [customOfferSkill, setCustomOfferSkill] = useState("");
  const [showCustomOffer, setShowCustomOffer] = useState(false);
  const [offerExperience, setOfferExperience] = useState("1_to_3");
  const [offerApplication, setOfferApplication] = useState("moderate");
  const [customOfferCategory, setCustomOfferCategory] = useState("Technology");

  const [selectedWantSkill, setSelectedWantSkill] = useState("");
  const [customWantSkill, setCustomWantSkill] = useState("");
  const [showCustomWant, setShowCustomWant] = useState(false);
  const [wantExperience, setWantExperience] = useState("1_to_3");
  const [wantApplication, setWantApplication] = useState("moderate");
  const [customWantCategory, setCustomWantCategory] = useState("Technology");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const EXPERIENCE_OPTIONS = [
    { value: "less_than_1", label: "Less than 1 Year", desc: "Just started learning or practicing recently." },
    { value: "1_to_3", label: "1 to 3 Years", desc: "Consistent learning or regular hobbyist practice." },
    { value: "more_than_3", label: "More than 3 Years", desc: "Long-term dedication or professional expertise." }
  ];

  const APPLICATION_OPTIONS = [
    { value: "basic", label: "Theory & Exercises", desc: "Focused on basic syntax, classes, or introductory exercises." },
    { value: "moderate", label: "Medium Projects", desc: "Created 1-3 functional projects or practice regular hobbies." },
    { value: "advanced", label: "High Scale / Professional", desc: "Built 4+ complex projects, high scale systems, or expert hobby work." }
  ];

  const calculateLevel = (experience, application) => {
    if (experience === "less_than_1" || application === "basic") {
      return "Easy";
    }
    if (experience === "more_than_3" && application === "advanced") {
      return "Advanced";
    }
    return "Medium";
  };

  const normalizeSkills = (skillsArray, catalog = []) => {
    if (!skillsArray) return [];
    return skillsArray.map(item => {
      if (typeof item === 'string') {
        const found = catalog.find(s => s.name.toLowerCase() === item.toLowerCase());
        return { skill: item, level: 'Easy', category: found ? found.category : 'Technology' };
      }
      if (item && typeof item === 'object' && item.skill) {
        const found = catalog.find(s => s.name.toLowerCase() === item.skill.toLowerCase());
        return {
          skill: item.skill,
          level: item.level || 'Medium',
          category: item.category || (found ? found.category : 'Technology')
        };
      }
      return null;
    }).filter(Boolean);
  };

  useEffect(() => {
    // Fetch skills catalog from backend
    fetch(`${API_BASE_URL}/api/skills`)
      .then((res) => res.json())
      .then((data) => {
        setSkillsCatalog(data);
        if (data.length > 0) {
          setSelectedOfferSkill(data[0].name);
          setSelectedWantSkill(data[0].name);
        }

        // Normalize user skills loaded from localStorage after fetching catalog
        const saved = JSON.parse(localStorage.getItem("user"));
        if (saved) {
          setMe(saved);
          setBio(saved.bio || "");
          setRating(saved.rating || 5.0);
          setCompletedExchanges(saved.completedExchanges || 0);
          setBadges(saved.badges || []);
          setReviews(saved.reviews || []);
          
          setOffer(normalizeSkills(saved.offer || [], data));
          setWant(normalizeSkills(saved.want || [], data));
          
          // Fetch potential peers to submit reviews for
          fetchPeers(saved.email);
        }
      })
      .catch((err) => {
        console.error("Error loading skills directory:", err);
      });
  }, []);

  const fetchPeers = async (myEmail) => {
    try {
      const response = await fetch(`https://skillbarter-05s6.onrender.com/api/users?exclude=${encodeURIComponent(myEmail)}`);
      const data = await response.json();
      if (response.ok) {
        setPeers(data);
        if (data.length > 0) {
          setReviewTarget(data[0].email);
        }
      }
    } catch (e) {
      console.error("Failed to load peer users list:", e);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!me || !reviewTarget || reviewLoading) return;

    if (!reviewComment.trim()) {
      setReviewError("Please type a comment for your review.");
      return;
    }

    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: reviewTarget,
          reviewerName: me.name,
          reviewerEmail: me.email,
          rating: reviewStars,
          comment: reviewComment.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReviewSuccess("Review submitted successfully!");
        setReviewComment("");
        // If the reviewer reviewed themselves (not typical) or just refresh peers list
        fetchPeers(me.email);
        setTimeout(() => setReviewSuccess(""), 3000);
      } else {
        setReviewError(data.error || "Failed to submit review.");
      }
    } catch (err) {
      setReviewError("Something went wrong submitting your review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const addOfferSkill = () => {
    const skillName = showCustomOffer ? customOfferSkill.trim() : selectedOfferSkill;
    const level = calculateLevel(offerExperience, offerApplication);

    if (!skillName) return;

    // Check if skill already exists in offers
    if (offer.some(s => s.skill.toLowerCase() === skillName.toLowerCase())) {
      setError("You already added this skill to your teaching list!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    let category = "Technology";
    if (showCustomOffer) {
      category = customOfferCategory;
    } else {
      const catalogSkill = skillsCatalog.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      if (catalogSkill && catalogSkill.category) {
        category = catalogSkill.category === "Technical" ? "Technology" : (catalogSkill.category === "Non-Technical" ? "Design" : catalogSkill.category);
      }
    }

    setOffer([...offer, { skill: skillName, level, category }]);
    setCustomOfferSkill("");
    setShowCustomOffer(false);
    setOfferExperience("1_to_3");
    setOfferApplication("moderate");
  };

  const addWantSkill = () => {
    const skillName = showCustomWant ? customWantSkill.trim() : selectedWantSkill;
    const level = calculateLevel(wantExperience, wantApplication);

    if (!skillName) return;

    // Check if skill already exists in wants
    if (want.some(s => s.skill.toLowerCase() === skillName.toLowerCase())) {
      setError("You already added this skill to your learning list!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    let category = "Technology";
    if (showCustomWant) {
      category = customWantCategory;
    } else {
      const catalogSkill = skillsCatalog.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      if (catalogSkill && catalogSkill.category) {
        category = catalogSkill.category === "Technical" ? "Technology" : (catalogSkill.category === "Non-Technical" ? "Design" : catalogSkill.category);
      }
    }

    setWant([...want, { skill: skillName, level, category }]);
    setCustomWantSkill("");
    setShowCustomWant(false);
    setWantExperience("1_to_3");
    setWantApplication("moderate");
  };

  const removeSkill = (type, skillName) => {
    if (type === "offer") {
      setOffer(offer.filter((s) => s.skill !== skillName));
    } else {
      setWant(want.filter((s) => s.skill !== skillName));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const saved = JSON.parse(localStorage.getItem("user"));
    if (!saved || !saved.email) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: saved.email,
          bio,
          offer,
          want,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile settings.");
      }

      // Update localStorage with updated data (preserving reviews and ratings calculated at server)
      localStorage.setItem("user", JSON.stringify({
        ...saved,
        ...data
      }));
      setSuccess(true);
      
      // Navigate to dashboard after short delay to show success animation
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case "Easy": return "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20";
      case "Medium": return "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
      case "Advanced": return "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
      default: return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600";
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Top Mentor": return "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "Trusted Trader": return "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "Skill Maestro": return "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      default: return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    }
  };

  if (!me) return null;

  return (
    <div className="min-h-screen theme-bg-page transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-in">
        
        {/* Profile Statistics Dashboard */}
        <header className="mb-12 theme-bg-card p-10 rounded-[3rem] border theme-border flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
          <div className="space-y-4 text-center md:text-left">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/15 mx-auto md:mx-0">
              {me.name[0]}
            </div>
            <div>
              <h1 className="text-4xl font-black theme-text-primary tracking-tight leading-none">{me.name}</h1>
              <p className="text-xs theme-text-muted font-bold block mt-1.5">{me.email}</p>
            </div>
            
            {/* Badges Earned */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {badges.map(b => (
                  <span key={b} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getBadgeColor(b)}`}>
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 shrink-0">
            <div className="theme-bg-page border theme-border rounded-2xl px-6 py-4 text-center">
              <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-1">Exchange Rating</span>
              <div className="text-2xl font-black theme-text-primary flex items-center justify-center gap-1">
                <span className="text-amber-500">★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="theme-bg-page border theme-border rounded-2xl px-6 py-4 text-center">
              <span className="text-[8px] font-black theme-text-muted uppercase tracking-widest block mb-1">Trades Swaps</span>
              <div className="text-2xl font-black theme-text-primary">
                {completedExchanges}
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 px-6 py-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-3xl text-red-500 text-sm font-semibold leading-relaxed">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="mb-8 px-6 py-4 bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 rounded-3xl text-green-500 text-sm font-semibold leading-relaxed">
            Success: Profile settings saved successfully! Redirecting...
          </div>
        )}

        <form onSubmit={saveProfile} className="space-y-10">
          
          {/* Bio Section */}
          <section className="theme-bg-card p-10 rounded-[2.5rem] border theme-border transition-all">
            <h2 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] mb-6">
              About Me (Bio)
            </h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other barter members who you are, what projects you are building, or what your teaching philosophy is..."
              rows={4}
              className="w-full px-6 py-5 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-medium placeholder:text-neutral-300 resize-none leading-relaxed"
            />
          </section>

          {/* Skills Offered Section */}
          <section className="theme-bg-card p-10 rounded-[2.5rem] border theme-border transition-all">
            <h2 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] mb-6">
              Skills I can teach
            </h2>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {!showCustomOffer ? (
                  <select
                    value={selectedOfferSkill}
                    onChange={(e) => setSelectedOfferSkill(e.target.value)}
                    className="flex-1 px-5 py-4 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-bold"
                  >
                    {skillsCatalog.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={customOfferSkill}
                    onChange={(e) => setCustomOfferSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Type custom skill name (e.g. Guitar, French, C++)..."
                    className="flex-1 px-5 py-4 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-bold placeholder:text-neutral-300"
                  />
                )}

                <button
                  type="button"
                  onClick={() => setShowCustomOffer(!showCustomOffer)}
                  className="px-6 py-4 rounded-2xl border border-blue-500/20 text-blue-600 hover:bg-blue-500/5 text-xs font-black uppercase tracking-widest transition-all"
                >
                  {showCustomOffer ? "← Standard List" : "💡 Custom Skill"}
                </button>
              </div>

              {showCustomOffer && (
                <div className="bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-2xl border theme-border">
                  <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-3">
                    Skill Type / Category
                  </span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCustomOfferCategory("Technology")}
                      className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${
                        customOfferCategory === "Technology"
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      Technology
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomOfferCategory("Design")}
                      className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${
                        customOfferCategory === "Design"
                          ? "bg-purple-600 border-purple-600 text-white shadow-md"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      Design
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Evaluation Box */}
            <div className="bg-neutral-50 dark:bg-neutral-900/30 p-6 rounded-3xl border theme-border mb-8 space-y-6">
              <div>
                <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-2.5">
                  1. PRACTICE / LEARNING DURATION
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOfferExperience(opt.value)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        offerExperience === opt.value
                          ? "border-blue-600 bg-blue-600/5 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{opt.label}</div>
                      <div className="text-[9px] opacity-70 leading-relaxed font-semibold">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-2.5">
                  2. HANDS-ON APPLICATION / EXPERIENCE
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {APPLICATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOfferApplication(opt.value)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        offerApplication === opt.value
                          ? "border-blue-600 bg-blue-600/5 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{opt.label}</div>
                      <div className="text-[9px] opacity-70 leading-relaxed font-semibold">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs theme-text-muted font-bold">Evaluated Level:</span>
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border ${getLevelBadgeColor(calculateLevel(offerExperience, offerApplication))}`}>
                    🎯 {calculateLevel(offerExperience, offerApplication)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addOfferSkill}
                  className="w-full sm:w-auto bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 hover:bg-blue-600 dark:hover:bg-neutral-200"
                >
                  Add Evaluated Skill
                </button>
              </div>
            </div>

            {/* Divided Skill Portfolio display */}
            <div className="space-y-6 pt-4 border-t theme-border">
              <div>
                <span className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                  💻 Technology Skills ({offer.filter(item => item.category === "Technology").length})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {offer.filter(item => item.category === "Technology").map((item) => (
                    <span
                      key={item.skill}
                      className="theme-bg-page theme-text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border theme-border shadow-sm transition-all"
                    >
                      <span className="font-black uppercase tracking-wider">{item.skill}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getLevelBadgeColor(item.level)}`}>
                        {item.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill("offer", item.skill)}
                        className="theme-text-muted hover:text-red-500 font-bold transition-colors ml-1 text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {offer.filter(item => item.category === "Technology").length === 0 && (
                    <p className="text-xs theme-text-muted font-medium italic">No technology skills added yet.</p>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3">
                  🎨 Design & Hobbies Skills ({offer.filter(item => item.category !== "Technology").length})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {offer.filter(item => item.category !== "Technology").map((item) => (
                    <span
                      key={item.skill}
                      className="theme-bg-page theme-text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border theme-border shadow-sm transition-all"
                    >
                      <span className="font-black uppercase tracking-wider">{item.skill}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getLevelBadgeColor(item.level)}`}>
                        {item.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill("offer", item.skill)}
                        className="theme-text-muted hover:text-red-500 font-bold transition-colors ml-1 text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {offer.filter(item => item.category !== "Technology").length === 0 && (
                    <p className="text-xs theme-text-muted font-medium italic">No design or hobby skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Skills Wanted Section */}
          <section className="theme-bg-card p-10 rounded-[2.5rem] border theme-border transition-all">
            <h2 className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] mb-6">
              Skills I want to learn
            </h2>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {!showCustomWant ? (
                  <select
                    value={selectedWantSkill}
                    onChange={(e) => setSelectedWantSkill(e.target.value)}
                    className="flex-1 px-5 py-4 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-bold"
                  >
                    {skillsCatalog.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={customWantSkill}
                    onChange={(e) => setCustomWantSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Type custom skill name (e.g. Guitar, French, C++)..."
                    className="flex-1 px-5 py-4 rounded-2xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-bold placeholder:text-neutral-300"
                  />
                )}

                <button
                  type="button"
                  onClick={() => setShowCustomWant(!showCustomWant)}
                  className="px-6 py-4 rounded-2xl border border-blue-500/20 text-blue-600 hover:bg-blue-500/5 text-xs font-black uppercase tracking-widest transition-all"
                >
                  {showCustomWant ? "← Standard List" : "💡 Custom Skill"}
                </button>
              </div>

              {showCustomWant && (
                <div className="bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-2xl border theme-border">
                  <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-3">
                    Skill Type / Category
                  </span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCustomWantCategory("Technology")}
                      className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${
                        customWantCategory === "Technology"
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      Technology
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomWantCategory("Design")}
                      className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${
                        customWantCategory === "Design"
                          ? "bg-purple-600 border-purple-600 text-white shadow-md"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      Design
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Evaluation Box */}
            <div className="bg-neutral-50 dark:bg-neutral-900/30 p-6 rounded-3xl border theme-border mb-8 space-y-6">
              <div>
                <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-2.5">
                  1. INTENDED PRACTICE DURATION
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWantExperience(opt.value)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        wantExperience === opt.value
                          ? "border-blue-600 bg-blue-600/5 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{opt.label}</div>
                      <div className="text-[9px] opacity-70 leading-relaxed font-semibold">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[9px] font-black theme-text-muted uppercase tracking-[0.2em] mb-2.5">
                  2. PROJECT APPLICATION TARGETS
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {APPLICATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWantApplication(opt.value)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        wantApplication === opt.value
                          ? "border-blue-600 bg-blue-600/5 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                          : "theme-bg-page theme-border theme-text-secondary hover:theme-text-primary"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{opt.label}</div>
                      <div className="text-[9px] opacity-70 leading-relaxed font-semibold">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t theme-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs theme-text-muted font-bold">Evaluated Level:</span>
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border ${getLevelBadgeColor(calculateLevel(wantExperience, wantApplication))}`}>
                    🎯 {calculateLevel(wantExperience, wantApplication)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addWantSkill}
                  className="w-full sm:w-auto bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 hover:bg-blue-600 dark:hover:bg-neutral-200"
                >
                  Add Evaluated Skill
                </button>
              </div>
            </div>

            {/* Divided Skill Portfolio display */}
            <div className="space-y-6 pt-4 border-t theme-border">
              <div>
                <span className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                  💻 Technology Skills ({want.filter(item => item.category === "Technology").length})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {want.filter(item => item.category === "Technology").map((item) => (
                    <span
                      key={item.skill}
                      className="theme-bg-page theme-text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border theme-border shadow-sm transition-all"
                    >
                      <span className="font-black uppercase tracking-wider">{item.skill}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getLevelBadgeColor(item.level)}`}>
                        {item.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill("want", item.skill)}
                        className="theme-text-muted hover:text-red-500 font-bold transition-colors ml-1 text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {want.filter(item => item.category === "Technology").length === 0 && (
                    <p className="text-xs theme-text-muted font-medium italic">No technology skills added yet.</p>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3">
                  🎨 Design & Hobbies Skills ({want.filter(item => item.category !== "Technology").length})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {want.filter(item => item.category !== "Technology").map((item) => (
                    <span
                      key={item.skill}
                      className="theme-bg-page theme-text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border theme-border shadow-sm transition-all"
                    >
                      <span className="font-black uppercase tracking-wider">{item.skill}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getLevelBadgeColor(item.level)}`}>
                        {item.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill("want", item.skill)}
                        className="theme-text-muted hover:text-red-500 font-bold transition-colors ml-1 text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {want.filter(item => item.category !== "Technology").length === 0 && (
                    <p className="text-xs theme-text-muted font-medium italic">No design or hobby skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || offer.length === 0 || want.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-blue-500/20"
            >
              {loading ? "Saving settings..." : "Save profile settings"}
            </button>
          </div>
        </form>

        {/* Reviews timeline & Peer review submission */}
        <div className="grid md:grid-cols-2 gap-10 mt-12 pt-12 border-t theme-border">
          
          {/* Reviews Received history */}
          <section className="theme-bg-card p-10 rounded-[2.5rem] border theme-border shadow-sm flex flex-col justify-between min-h-[450px]">
            <div>
              <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] block mb-6">
                Trade Reviews Received
              </span>
              
              {reviews.length > 0 ? (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-5 theme-bg-page border theme-border rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold theme-text-primary text-xs leading-none">{rev.reviewerName}</h4>
                          <span className="text-[8px] theme-text-muted font-bold block mt-1">{rev.date}</span>
                        </div>
                        <div className="text-amber-500 text-xs font-bold bg-neutral-100 dark:bg-neutral-900 border theme-border px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          ★ <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="theme-text-secondary text-[11px] leading-relaxed font-semibold italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 theme-bg-page border border-dashed theme-border rounded-2xl">
                  <p className="theme-text-muted text-xs font-semibold italic">No review feedbacks received yet.</p>
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t theme-border text-center">
              <span className="text-[9px] theme-text-muted font-bold">Reviews build reputation score compatible matches.</span>
            </div>
          </section>

          {/* Submit review for a peer form */}
          <section className="theme-bg-card p-10 rounded-[2.5rem] border theme-border shadow-sm">
            <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] block mb-4">
              Submit Review for a Peer
            </span>
            
            {reviewError && (
              <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold">
                Error: {reviewError}
              </div>
            )}
            {reviewSuccess && (
              <div className="mb-4 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-[10px] font-bold">
                Success: {reviewSuccess}
              </div>
            )}

            <form onSubmit={handlePostReview} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">Barter Member</label>
                <select
                  value={reviewTarget}
                  onChange={(e) => setReviewTarget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 font-bold text-xs"
                  required
                >
                  <option value="" disabled>Select a peer member...</option>
                  {peers.map(p => (
                    <option key={p.email} value={p.email}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                  {peers.length === 0 && (
                    <option value="" disabled>No other members found.</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">Exchanges Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border transition-all ${
                        reviewStars >= star
                          ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/15"
                          : "theme-bg-page theme-border theme-text-muted"
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black theme-text-muted uppercase tracking-widest ml-1">Trade Comment Feedbacks</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was your exchange experience with this member? Were they helpful, punctual, and clear?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border theme-border theme-bg-page theme-text-primary outline-none focus:border-blue-600 transition-all font-semibold text-xs resize-none placeholder:text-neutral-300"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading || !reviewTarget || !reviewComment.trim()}
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-30"
              >
                {reviewLoading ? "Submitting..." : "Submit Trade Review"}
              </button>
            </form>
          </section>

        </div>

        {/* Session Control / Logout Section */}
        <section className="theme-bg-card p-10 rounded-[2.5rem] border border-red-500/10 dark:border-red-500/5 transition-all flex flex-col md:flex-row justify-between items-center gap-6 mt-12 shadow-sm">
          <div>
            <h3 className="text-lg font-black text-red-500 uppercase tracking-wider mb-2">
              Session Control
            </h3>
            <p className="theme-text-secondary text-sm font-medium">
              Ready to leave? Make sure to save any changes before logging out of your session.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            Log Out
          </button>
        </section>

      </main>
    </div>
  );
}