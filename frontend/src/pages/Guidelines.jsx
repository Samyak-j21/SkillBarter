import Navbar from "../components/Navbar";

export default function Guidelines() {
  const rules = [
    {
      title: "Zero Tolerance for Harassment & Profanity",
      desc: "Using cussed words, slurs, or any speech that demeans, harasses, or harms individuals or communities will result in immediate, permanent account suspension. We scan chat reports strictly.",
      badge: "Strict Policy",
      badgeColor: "bg-red-500/10 text-red-500 border-red-500/20"
    },
    {
      title: "Fair Level Assessment Alignment",
      desc: "Be honest about your skills and levels. Do not inflate experience. We evaluate compatibility objectively, and fair trades build long-term professional relationships.",
      badge: "Honesty First",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    {
      title: "Safety & Privacy First",
      desc: "Never share sensitive private credentials, bank logins, or high-risk personal information in chat channels. Finalize all skill-exchange goals safely within the proposed barter deals.",
      badge: "Security Guidelines",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
    },
    {
      title: "Professionalism in Exchange",
      desc: "Honor accepted barter deals. Show up to scheduled calls or learning slots on time. If you need to rearrange a session, communicate transparently inside your chat thread.",
      badge: "Accountability",
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    }
  ];

  return (
    <div className="min-h-screen theme-bg-page transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-in">
        <header className="mb-16 text-center">
          <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
            Community Code of Conduct
          </span>
          <h1 className="text-5xl md:text-6xl font-black theme-text-primary tracking-tight leading-none">
            Guidelines & Safety
          </h1>
          <p className="text-lg theme-text-secondary max-w-xl mx-auto mt-4 font-medium leading-relaxed">
            SkillBarter is built on trust, respect, and mutual growth. Please review our safety boundaries, chat regulations, and platform compliance terms.
          </p>
        </header>

        {/* Warning Banner Card */}
        <section className="mb-12 theme-bg-card border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent rounded-[2.5rem] p-8 md:p-10 shadow-sm classy-glow">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-black shrink-0">
              ALERT
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-wide">Account Suspension Warning</h3>
              <p className="theme-text-secondary text-sm font-medium leading-relaxed">
                Our team takes safety seriously. If any member uses cussed language, offensive jokes, slurs, threats, or publishes any content that harms any community, their account will be <strong>permanently suspended</strong> immediately, without any warning or right of appeal. All ongoing deal chats and trade boards will be instantly terminated.
              </p>
            </div>
          </div>
        </section>

        {/* Core Rules Section */}
        <section className="space-y-6">
          <h2 className="text-xs font-black theme-text-muted uppercase tracking-[0.2em] mb-4">Core Principles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {rules.map((rule, index) => (
              <div 
                key={index}
                className="theme-bg-card rounded-[2rem] p-8 border theme-border flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="space-y-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${rule.badgeColor}`}>
                    {rule.badge}
                  </span>
                  <h3 className="text-xl font-bold theme-text-primary">{rule.title}</h3>
                  <p className="theme-text-secondary text-xs font-medium leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reporting Block */}
        <section className="mt-16 theme-bg-card rounded-[2.5rem] p-10 border theme-border text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center theme-accent text-xs font-black mx-auto">
            SECURE
          </div>
          <div className="space-y-3 max-w-lg mx-auto">
            <h3 className="text-2xl font-bold theme-text-primary">How to Report Toxic Members</h3>
            <p className="theme-text-secondary text-sm font-medium leading-relaxed">
              If you experience any harassment or witness toxic behavior inside chats or community forums, click the **Flag/Report** button or contact our compliance support directly at **trust@skillbarter.com** with chat logs. We investigate all claims within 12 hours.
            </p>
          </div>
          <div className="pt-2">
            <a 
              href="mailto:trust@skillbarter.com"
              className="inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-500 dark:hover:text-white transition-all active:scale-95 shadow-md"
            >
              Report Harassment
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
