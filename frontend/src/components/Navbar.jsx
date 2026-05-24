import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Search", path: "/search" },
    { name: "Requests", path: "/requests" },
    { name: "Swipe Match", path: "/match" },
    { name: "Roadmaps", path: "/roadmaps" },
    { name: "Community", path: "/community" },
    { name: "Inbox", path: "/chat" },
    { name: "Guidelines", path: "/guidelines" }
  ];

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) {
        setUser(JSON.parse(u));
      }
    } catch (e) {
      console.error("Failed to load user profile in navbar:", e);
    }
  }, [location.pathname]); // Refresh user info on page changes

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownOpen && !e.target.closest(".profile-dropdown-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  const getInitials = () => {
    if (user && user.name) {
      return user.name[0].toUpperCase();
    }
    return "S";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="w-full theme-bg-card border-b theme-border sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
        
        {/* Brand Logo */}
        <h1
          className="font-black text-2xl theme-accent cursor-pointer tracking-tighter hover:opacity-80 transition-opacity shrink-0"
          onClick={() => navigate("/dashboard")}
        >
          Skill<span className="theme-text-primary">Barter</span>
        </h1>

        {/* Desktop Menu links (Hidden on screens < 1024px / lg) */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-6 mx-4">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-[9px] xl:text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:theme-accent hover:scale-105 active:scale-95 whitespace-nowrap ${
                location.pathname === link.path
                  ? "theme-accent border-b-2 border-blue-600 pb-1"
                  : "theme-text-muted"
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Action Controls & Dropdown Menu */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
          
          {/* Visual SVG Sun/Moon Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 xl:w-10 xl:h-10 flex items-center justify-center rounded-xl border theme-border theme-text-muted theme-bg-hover transition-all duration-300 hover:scale-105 active:scale-95"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.59 1.59m10.91 10.91l1.59 1.59M3 12h2.25m13.5 0H21M6.54 17.46l-1.59 1.59m13.55-13.55l-1.59 1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            )}
          </button>

          {/* Interactive Profile Dropdown container */}
          <div className="relative profile-dropdown-container">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 xl:w-10 xl:h-10 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-neutral-900 font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              {getInitials()}
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 theme-bg-card border theme-border rounded-2xl shadow-xl p-4 space-y-3.5 z-50 animate-scale-up">
                <div className="border-b theme-border pb-2.5">
                  <p className="text-xs font-black theme-text-primary truncate">{user?.name || "Member"}</p>
                  <p className="text-[9px] theme-text-muted font-bold truncate mt-0.5">{user?.email || "No session active"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black theme-text-secondary hover:theme-bg-hover hover:theme-text-primary transition-all"
                  >
                    Configure Profile
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate("/guidelines"); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black theme-text-secondary hover:theme-bg-hover hover:theme-text-primary transition-all"
                  >
                    Guidelines & Conduct
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black text-red-500 hover:bg-red-500/10 transition-all mt-1"
                  >
                    Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger menu trigger (Hidden on screens >= 1024px / lg) */}
        <div className="flex items-center gap-3.5 lg:hidden">
          
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg border theme-border theme-text-muted theme-bg-hover transition-colors"
          >
            {theme === "light" ? (
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.59 1.59m10.91 10.91l1.59 1.59M3 12h2.25m13.5 0H21M6.54 17.46l-1.59 1.59m13.55-13.55l-1.59 1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 theme-text-primary focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="lg:hidden theme-bg-card border-b theme-border py-5 px-4 absolute top-[100%] left-0 w-full shadow-2xl animate-fade-in z-50 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileOpen(false);
                }}
                className={`text-left py-3 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  location.pathname === link.path
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "theme-bg-hover theme-text-secondary hover:theme-text-primary"
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="border-t theme-border pt-4 mt-2 flex justify-between items-center px-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black theme-text-primary">{user?.name || "Member"}</span>
                <span className="text-[8px] theme-text-muted font-bold tracking-wide truncate max-w-[150px]">{user?.email || ""}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setMobileOpen(false); navigate("/profile"); }}
                  className="text-[10px] font-black uppercase tracking-widest theme-text-secondary hover:theme-text-primary"
                >
                  Profile
                </button>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}