import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function BarterMatch() {
  const [currentUser, setCurrentUser] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeState, setSwipeState] = useState(""); // "left" or "right" or ""
  const navigate = useNavigate();

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

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Top Mentor": return "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "Trusted Trader": return "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "Skill Maestro": return "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      default: return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
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
      fetchSwipeFeed(data.email);
    } catch (e) {
      navigate("/");
    }
  }, []);

  const fetchSwipeFeed = async (email) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`https://skillbarter-05s6.onrender.com/api/users/swipe-feed?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load discovery feed.");
      }
      setFeed(data);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || "Failed to load swipe discovery feed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (swipeState !== "") return; // wait for transition
    setSwipeState(direction);

    setTimeout(() => {
      if (direction === "right") {
        // Express Interest: redirect to chat with candidate preselected
        const candidate = feed[currentIndex];
        navigate("/chat", { state: { selectedUser: candidate } });
      } else {
        // Skip: load next card
        setCurrentIndex(prev => prev + 1);
        setSwipeState("");
      }
    }, 400); // match CSS animation speed
  };

  if (!currentUser) return null;

  const currentCard = !loading && currentIndex < feed.length ? feed[currentIndex] : null;

  return (
    <div className="min-h-screen theme-bg-page flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12 flex flex-col justify-center animate-fade-in relative z-10">
        <header className="mb-8 text-center shrink-0">
          <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            Discovery Swipe Match
          </span>
          <h1 className="text-4xl font-black theme-text-primary tracking-tight leading-none">
            Swipe Exchanges
          </h1>
          <p className="theme-text-secondary text-xs mt-2 font-semibold">
            Discover new trading partners you haven't chatted with yet.
          </p>
        </header>

        {error && (
          <div className="mb-6 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-xs font-semibold">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="flex-1 min-h-[480px] theme-bg-card rounded-[3rem] border theme-border animate-pulse shadow-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[10px] theme-text-muted font-black uppercase tracking-widest">Preparing matches feed...</p>
            </div>
          </div>
        ) : currentCard ? (
          <div className="flex-1 flex flex-col justify-between min-h-[500px]">
            {/* Swiper Card Frame */}
            <div 
              className={`flex-1 theme-bg-card rounded-[3rem] p-8 md:p-10 border theme-border shadow-xl classy-glow flex flex-col justify-between transition-all duration-300 relative ${
                swipeState === "left" ? "swipe-left" : swipeState === "right" ? "swipe-right" : ""
              }`}
            >
              <div>
                {/* Score & Rating Bar */}
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/20 shadow-sm">
                    🎯 {currentCard.score}% COMPATIBLE
                  </span>
                  
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 border theme-border px-3 py-1 rounded-full text-xs font-black theme-text-primary">
                    <span className="text-amber-500">★</span>
                    <span>{currentCard.rating?.toFixed(1) || "5.0"}</span>
                  </div>
                </div>

                {/* Name, Badges & Exchanges Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-black theme-text-primary tracking-tight">{currentCard.name}</h2>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mt-1.5">
                      {currentCard.completedExchanges || 0} Successful Swaps
                    </span>
                  </div>

                  {/* Badges list */}
                  {currentCard.badges && currentCard.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentCard.badges.map(b => (
                        <span key={b} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getBadgeColor(b)}`}>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  <p className="theme-text-secondary text-sm leading-relaxed font-semibold">
                    {currentCard.bio || "No bio details added yet. Let's start chatting to share skills."}
                  </p>
                </div>

                {/* Skills Directory */}
                <div className="space-y-5 border-t theme-border pt-6">
                  <div>
                    <span className="text-[9px] font-black theme-text-muted uppercase tracking-widest block mb-2.5">Teaches</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCard.offer && currentCard.offer.length > 0 ? (
                        currentCard.offer.map(item => (
                          <span key={item.skill} className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${getSkillCategoryColor(item.category)}`}>
                            <span>{item.skill}</span>
                            <span className="text-[8px] opacity-60 font-black">({item.level ? item.level[0] : "?"})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs theme-text-muted font-medium italic">None listed</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black theme-text-muted uppercase tracking-widest block mb-2.5">Learns</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCard.want && currentCard.want.length > 0 ? (
                        currentCard.want.map(item => (
                          <span key={item.skill} className="theme-bg-page theme-text-primary px-3 py-1.5 rounded-xl text-xs font-bold border theme-border flex items-center gap-1.5">
                            <span>{item.skill}</span>
                            <span className="text-[8px] opacity-60 font-black">({item.level ? item.level[0] : "?"})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs theme-text-muted font-medium italic">None listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t theme-border shrink-0">
                <button
                  onClick={() => handleSwipe("left")}
                  className="flex-1 border-2 border-red-500/20 hover:border-red-500 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.97] hover:bg-red-500/5"
                >
                  Skip Card
                </button>
                <button
                  onClick={() => handleSwipe("right")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.97] shadow-xl shadow-green-500/20"
                >
                  Propose Trade
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[400px] theme-bg-card rounded-[3rem] p-10 border theme-border shadow-sm flex flex-col justify-center items-center text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-black">
              ✓
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black theme-text-primary">End of Discovery Feed</h3>
              <p className="theme-text-secondary text-sm max-w-xs mx-auto font-medium leading-relaxed">
                You've swiped through all available matching trades! Try expanding your wanted/offered skills inside your profile setup to find newer match vectors.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Expand Profile Skills
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
