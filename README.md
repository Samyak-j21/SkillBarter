# 🤝 SkillBarter — Dynamic Peer-to-Peer Skill Exchange Platform

SkillBarter is a premium, fully responsive, and gamified SaaS platform that enables developers, creatives, and experts to barter their skills directly. Instead of exchanging money, members trade their expertise (e.g., teaching fullstack React development in exchange for classical guitar training or marketing funnel optimization).

The application features a sleek **tactile warm-dim light/dark theme**, fully fluid layouts tailored for mobile, tablet, and desktop screens, and robust mathematical matching logic.

---

## 🚀 Key Features

*   **🎯 Smart Vector Compatibility**: Evaluates user skill portfolios and calculates real-time compatibility scores using **Cosine Similarity Mathematical Vector Models** to display matching exchange partners.
*   **📱 Tinder-style Discovery Swiper**: Interactive card deck (`/match`) that allows members to easily browse matching profiles using gesture-like skip or proposal triggers with rich animations.
*   **💬 Integrated Negotiation Chat**: Live workspace with short-polling messaging. Features an interactive **Barter Contract Creator** where members can select skill items, align levels, and add custom compensation options.
*   **🏅 Gamified Trust Badges & Metrics**: Keeps track of average ratings, completed barter exchange milestones, and automatically assigns achievements:
    *   `First Barter`: Logged after completing 1 trade.
    *   `Skill Maestro`: Earned after 3 successful barters.
    *   `Trusted Trader`: Granted after 10 completed trades.
    *   `Top Mentor`: Awarded for a 4.7+ star rating with at least 5 completed trades.
*   **🗺️ Interactive Learning Roadmaps**: Structured learning pathways for Web Development, Data Science & AI, and Digital Marketing. Instantly displays a list of registered tutors teaching each individual pathway step.
*   **📋 Open Bulletin Request Board**: A public message board where members can search, filter, and publish custom skill needs and offerings.
*   **🛡️ Conduct Guidelines & Strict Compliance**: In-depth rules section detailing safety, privacy boundaries, and a zero-tolerance policy against slurs or harassment.

---

## 🛠️ Technology Stack

*   **Frontend Client**: React (v18.3.1) + Vite (v8.0.8) for near-instant rendering and compilation.
*   **Styling System**: TailwindCSS (v3.4.19) + native CSS custom variables in `main.css` for the warm-dim alabaster matte palette.
*   **Routing**: React Router DOM (v6.30.3) managing the SPA flow.
*   **Backend Server**: Node.js + Express.js API engine.
*   **Storage**: Segmented JSON database system located under `backend/databases/` (handling users, deals, requests, and message feeds).

---

## 📁 Repository Structure

```
SkillBarter/
├── backend/
│   ├── databases/          # Decoupled JSON database files
│   ├── cryptoHelper.js     # Secure credential hashing
│   ├── server.js           # Express API endpoints & vector match models
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Navbar, etc.)
│   │   ├── context/        # Global state providers (Theme, etc.)
│   │   ├── pages/          # Core pages (Dashboard, Chat, Profile, etc.)
│   │   ├── styles/         # Global main.css stylesheet
│   │   ├── config.js       # Dynamic API Base URL resolver
│   │   └── App.jsx         # App router
│   ├── vercel.json         # Vercel SPA routing redirects
│   └── package.json
└── README.md
```

---

## 💻 Local Setup & Run instructions

### Prerequisites
*   Node.js (v18+ recommended)
*   npm

### 1. Run the Backend Server
```bash
cd backend
npm install
npm run dev # Runs nodemon on http://localhost:5000
```

### 2. Run the Frontend Client
```bash
cd ../frontend
npm install
npm run dev # Runs Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deployment Guidelines

### Backend — Render Deployment
The backend is pre-configured to dynamically bind to Render's injection port (`process.env.PORT`) and has CORS enabled for all origins.

1.  Create a new **Web Service** on [Render](https://render.com).
2.  Connect your GitHub repository.
3.  Set **Root Directory** to `backend`.
4.  Set **Build Command** to `npm install`.
5.  Set **Start Command** to `npm start`.
6.  Once deployed, copy the Render live URL (e.g. `https://skillbarter-backend.onrender.com`).

### Frontend — Vercel Deployment
The frontend is configured with a dynamic API Base URL resolver and has `vercel.json` SPA routing rewrites enabled.

1.  Create a new project on [Vercel](https://vercel.com).
2.  Connect your GitHub repository.
3.  Set **Root Directory** to `frontend`.
4.  In **Environment Variables**, add:
    *   Key: `VITE_API_BASE_URL`
    *   Value: `https://your-render-backend-url.onrender.com` (Your live Render URL without a trailing slash)
5.  Click **Deploy**. Vercel will compile the Vite assets and launch your site!

---

## 📜 License
Developed for peer-to-peer social learning and objective barter swaps. Zero tolerance rules against slurs, harassment, or profanity are strictly monitored.
