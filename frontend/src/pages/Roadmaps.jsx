import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Roadmaps() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePathway, setActivePathway] = useState("webdev");
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const pathways = {
    webdev: {
      title: "Web Development Pathway",
      desc: "Learn modern fullstack engineering from frontend design to database backends.",
      steps: [
        { name: "HTML", level: "Easy", desc: "Build structural markup, links, semantic tags, and document foundations." },
        { name: "CSS", level: "Easy", desc: "Style pages with layout systems like Flexbox, Grid, colors, and animations." },
        { name: "JavaScript", level: "Medium", desc: "Make pages alive with functions, DOM manipulations, API requests, and ES6+ async logic." },
        { name: "React", level: "Medium", desc: "Build modular reactive interfaces with components, hooks, props, and states." },
        { name: "Node.js", level: "Medium", desc: "Build fast backend web servers, file systems, and API frameworks." }
      ]
    },
    datascience: {
      title: "Data Science & AI Pathway",
      desc: "Harness data pipelines, statistics, databases, and AI modeling logic.",
      steps: [
        { name: "Python", level: "Easy", desc: "Learn programming fundamentals, loops, data structures, and algorithms." },
        { name: "Pandas", level: "Medium", desc: "Clean and manipulate data matrices, series, and datasets easily." },
        { name: "SQL", level: "Medium", desc: "Query relational database tables, perform joins, and build data schemes." },
        { name: "Data Science", level: "Advanced", desc: "Build statistics analysis, models, training sets, and regression pipelines." }
      ]
    },
    marketing: {
      title: "Digital Marketing Mastery",
      desc: "Drive growth, traffic acquisition, conversions, and target audience hooks.",
      steps: [
        { name: "SEO", level: "Easy", desc: "Optimize meta tags, keyword indexing, and rank higher on search engines." },
        { name: "Marketing", level: "Easy", desc: "Understand branding vectors, funnel conversions, and copy optimizations." }
      ]
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
      fetchUsers(data.email);
    } catch (e) {
      navigate("/");
    }
  }, []);

  const fetchUsers = async (myEmail) => {
    setLoading(true);
    try {
      const response = await fetch(`https://skillbarter-05s6.onrender.com/api/users?exclude=${encodeURIComponent(myEmail)}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to load user directory for tutors lookup:", e);
    } finally {
      setLoading(false);
    }
  };

  const getTutorsForStep = (stepName) => {
    return users.filter(user => 
      user.offer.some(item => item.skill.toLowerCase() === stepName.toLowerCase())
    );
  };

  if (!currentUser) return null;

  const currentPathway = pathways[activePathway];
  const currentStep = currentPathway.steps[activeStepIndex];
  const matchingTutors = getTutorsForStep(currentStep.name);

  return (
    <div className="min-h-screen theme-bg-page transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-in">
        <header className="mb-12">
          <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
            Interactive Learning Guides
          </span>
          <h1 className="text-5xl font-black theme-text-primary tracking-tight">
            Learning Roadmaps
          </h1>
          <p className="text-xl theme-text-secondary mt-3 font-medium max-w-xl">
            Structured steps to master new trades with dynamic suggestions of registered members who can teach each step.
          </p>
        </header>

        {/* Pathway Picker */}
        <div className="flex gap-3 flex-wrap mb-10">
          {[
            { id: "webdev", label: "Web Development", pathway: pathways.webdev },
            { id: "datascience", label: "Data Science & AI", pathway: pathways.datascience },
            { id: "marketing", label: "Digital Marketing", pathway: pathways.marketing }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                setActivePathway(opt.id);
                setActiveStepIndex(0);
              }}
              className={`px-6 py-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                activePathway === opt.id
                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/15"
                  : "theme-bg-card theme-border theme-text-secondary hover:theme-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* LEFT: STEP SEQUENCE TREE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="theme-bg-card rounded-[2.5rem] p-8 md:p-10 border theme-border shadow-sm">
              <h2 className="text-2xl font-black theme-text-primary tracking-tight mb-2">
                {currentPathway.title}
              </h2>
              <p className="theme-text-secondary text-sm font-semibold mb-8">
                {currentPathway.desc}
              </p>

              {/* Progress Steps Timeline */}
              <div className="space-y-4 relative">
                {currentPathway.steps.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                        isActive
                          ? "border-blue-500 bg-blue-600/5 dark:bg-blue-600/10 glassy-glow scale-[1.01]"
                          : "theme-border theme-bg-page hover:theme-border-secondary hover:scale-[1.005]"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm border ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "theme-bg-card theme-border theme-text-muted"
                      }`}>
                        {idx + 1}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold theme-text-primary text-sm tracking-wide uppercase">
                            {step.name}
                          </h4>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            step.level === "Easy"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : step.level === "Medium"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          }`}>
                            {step.level}
                          </span>
                        </div>
                        <p className="theme-text-secondary text-xs font-semibold leading-relaxed truncate">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Tutors suggested matches for selected step */}
          <div className="space-y-6">
            <div className="theme-bg-card rounded-[2.5rem] p-8 border theme-border shadow-sm flex flex-col min-h-[380px] justify-between">
              <div>
                <span className="text-[10px] font-bold theme-text-muted uppercase tracking-[0.2em] block mb-3">
                  Tutor Suggested Matches
                </span>
                <h3 className="text-xl font-black theme-text-primary tracking-tight mb-1 uppercase">
                  Step {activeStepIndex + 1}: {currentStep.name}
                </h3>
                <p className="theme-text-secondary text-xs leading-relaxed font-semibold mb-6">
                  {currentStep.desc}
                </p>

                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2].map(n => (
                      <div key={n} className="h-16 theme-bg-page border theme-border rounded-xl"></div>
                    ))}
                  </div>
                ) : matchingTutors.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {matchingTutors.map(tutor => (
                      <div 
                        key={tutor.email}
                        className="p-4 theme-bg-page border theme-border rounded-2xl flex items-center justify-between gap-3 group hover:border-blue-500 transition-all duration-300"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold theme-text-primary text-sm truncate">{tutor.name}</h4>
                          
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <div className="flex items-center text-[10px] font-black text-amber-500 gap-0.5">
                              ★ <span className="theme-text-primary">{tutor.rating?.toFixed(1) || "5.0"}</span>
                            </div>
                            <span className="text-[8px] font-bold theme-text-muted uppercase tracking-wider block">
                              • {tutor.completedExchanges || 0} Barters
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate("/chat", { state: { selectedUser: tutor } })}
                          className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 group-hover:bg-blue-600 group-hover:text-white px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0"
                        >
                          Learn
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="theme-bg-page border theme-border border-dashed p-6 rounded-2xl text-center space-y-3">
                    <p className="theme-text-muted text-xs font-semibold leading-relaxed">
                      No members are currently teaching **{currentStep.name}** in the platform directory.
                    </p>
                    <button
                      onClick={() => navigate("/requests")}
                      className="text-[9px] font-black theme-accent uppercase tracking-widest hover:underline"
                    >
                      Request this skill board →
                    </button>
                  </div>
                )}
              </div>

              {matchingTutors.length > 0 && (
                <div className="pt-6 border-t theme-border text-center">
                  <p className="text-[10px] theme-text-muted font-bold leading-relaxed">
                    Click **Learn** to open a direct chat thread to configure barter agreements.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
