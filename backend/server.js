import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hashPassword, verifyPassword } from "./cryptoHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATABASES_DIR = path.join(__dirname, "databases");
if (!fs.existsSync(DATABASES_DIR)) {
  fs.mkdirSync(DATABASES_DIR);
}

const DB_PATH = path.join(__dirname, "db.json");
const USERS_PATH = path.join(DATABASES_DIR, "users.json");
const MESSAGES_PATH = path.join(DATABASES_DIR, "messages.json");
const DEALS_PATH = path.join(DATABASES_DIR, "deals.json");
const SKILLS_PATH = path.join(DATABASES_DIR, "skills.json");
const POSTS_PATH = path.join(DATABASES_DIR, "posts.json");
const REQUESTS_PATH = path.join(DATABASES_DIR, "requests.json");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to read database from separated JSON files inside databases/ folder
function readDb() {
  const db = { users: [], messages: [], deals: [], skills: [], posts: [], requests: [] };
  
  try {
    if (fs.existsSync(USERS_PATH)) {
      db.users = JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error reading users database:", e);
  }
  
  try {
    if (fs.existsSync(MESSAGES_PATH)) {
      db.messages = JSON.parse(fs.readFileSync(MESSAGES_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error reading messages database:", e);
  }
  
  try {
    if (fs.existsSync(DEALS_PATH)) {
      db.deals = JSON.parse(fs.readFileSync(DEALS_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error reading deals database:", e);
  }
  
  try {
    if (fs.existsSync(SKILLS_PATH)) {
      db.skills = JSON.parse(fs.readFileSync(SKILLS_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error reading skills database:", e);
  }

  try {
    if (fs.existsSync(POSTS_PATH)) {
      db.posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error reading posts database:", e);
  }

  try {
    if (fs.existsSync(REQUESTS_PATH)) {
      db.requests = JSON.parse(fs.readFileSync(REQUESTS_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error reading requests database:", e);
  }
  
  return db;
}

// Helper to write database to separated JSON files inside databases/ folder
function writeDb(data) {
  try {
    if (data.users) fs.writeFileSync(USERS_PATH, JSON.stringify(data.users, null, 2), "utf8");
    if (data.messages) fs.writeFileSync(MESSAGES_PATH, JSON.stringify(data.messages, null, 2), "utf8");
    if (data.deals) fs.writeFileSync(DEALS_PATH, JSON.stringify(data.deals, null, 2), "utf8");
    if (data.skills) fs.writeFileSync(SKILLS_PATH, JSON.stringify(data.skills, null, 2), "utf8");
    if (data.posts) fs.writeFileSync(POSTS_PATH, JSON.stringify(data.posts, null, 2), "utf8");
    if (data.requests) fs.writeFileSync(REQUESTS_PATH, JSON.stringify(data.requests, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Automatically migrate single db.json and root json files to separated JSON files in databases/
function migrateSingleDbToSplit() {
  const rootFilesToMigrate = ["users.json", "messages.json", "deals.json", "skills.json", "posts.json"];
  rootFilesToMigrate.forEach(file => {
    const oldPath = path.join(__dirname, file);
    const newPath = path.join(DATABASES_DIR, file);
    if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
      console.log(`Migrating root database file ${file} into databases/ folder...`);
      try {
        fs.renameSync(oldPath, newPath);
      } catch (err) {
        console.error(`Failed to move database file ${file}:`, err);
      }
    }
  });

  if (fs.existsSync(DB_PATH) && !fs.existsSync(USERS_PATH)) {
    console.log("Migrating single db.json to separated JSON database files inside databases/...");
    try {
      const oldData = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      writeDb(oldData);
      fs.renameSync(DB_PATH, path.join(__dirname, "db.json.backup"));
      console.log("Separated database migration completed! Backup created at db.json.backup");
    } catch (e) {
      console.error("Failed to migrate unified db.json:", e);
    }
  }
}

// Trigger database separation migration check on load
migrateSingleDbToSplit();

// Initialize Mock Users if database has 0 users
function initializeMockUsers() {
  const db = readDb();
  if (db.users && db.users.length > 0) return;

  console.log("Initializing mock users inside db.json...");

  const mockUsersData = [
    {
      email: "rahul@skillbarter.com",
      name: "Rahul",
      password: "password123",
      offer: [
        { skill: "HTML", level: "Easy" },
        { skill: "CSS", level: "Easy" },
        { skill: "JavaScript", level: "Medium" }
      ],
      want: [
        { skill: "Python", level: "Medium" },
        { skill: "C++", level: "Advanced" }
      ],
      bio: "Frontend enthusiast looking to dive into system and backend programming."
    },
    {
      email: "priya@skillbarter.com",
      name: "Priya",
      password: "password123",
      offer: [
        { skill: "Python", level: "Medium" },
        { skill: "Data Science", level: "Advanced" }
      ],
      want: [
        { skill: "HTML", level: "Easy" },
        { skill: "UI/UX", level: "Medium" }
      ],
      bio: "Data scientist wanting to build beautiful and intuitive web apps."
    },
    {
      email: "arjun@skillbarter.com",
      name: "Arjun",
      password: "password123",
      offer: [
        { skill: "C++", level: "Advanced" },
        { skill: "Algorithms", level: "Advanced" }
      ],
      want: [
        { skill: "JavaScript", level: "Medium" },
        { skill: "React", level: "Medium" }
      ],
      bio: "Competitive programmer interested in building reactive web dev products."
    },
    {
      email: "sarah@skillbarter.com",
      name: "Sarah",
      password: "password123",
      offer: [
        { skill: "React", level: "Medium" },
        { skill: "Node.js", level: "Medium" }
      ],
      want: [
        { skill: "C++", level: "Advanced" },
        { skill: "Python", level: "Medium" }
      ],
      bio: "Fullstack dev looking to learn system-level programming and AI pipelines."
    },
    {
      email: "kevin@skillbarter.com",
      name: "Kevin",
      password: "password123",
      offer: [
        { skill: "UI/UX", level: "Medium" },
        { skill: "Figma", level: "Easy" }
      ],
      want: [
        { skill: "HTML", level: "Easy" },
        { skill: "CSS", level: "Easy" }
      ],
      bio: "Creative designer wanting to learn how to code my visual design components."
    },
    {
      email: "aisha@skillbarter.com",
      name: "Aisha",
      password: "password123",
      offer: [
        { skill: "Marketing", level: "Easy" },
        { skill: "SEO", level: "Easy" }
      ],
      want: [
        { skill: "Python", level: "Medium" },
        { skill: "Data Science", level: "Advanced" }
      ],
      bio: "Digital marketer looking to automate analytics tasks with data and Python."
    }
  ];

  db.users = mockUsersData.map(u => {
    const { salt, hash } = hashPassword(u.password);
    return {
      email: u.email,
      name: u.name,
      salt: salt,
      passwordHash: hash,
      offer: u.offer,
      want: u.want,
      bio: u.bio
    };
  });

  writeDb(db);
  console.log("Mock users initialized successfully in backend/db.json!");
}

// Preset Skill Categories Database
const PRESET_SKILL_CATEGORIES = {
  "html": "Technology",
  "css": "Technology",
  "javascript": "Technology",
  "python": "Technology",
  "c++": "Technology",
  "react": "Technology",
  "node.js": "Technology",
  "node": "Technology",
  "algorithms": "Technology",
  "data science": "Technology",
  "system programming": "Technology",
  "typescript": "Technology",
  "java": "Technology",
  "c#": "Technology",
  "sql": "Technology",
  "mongodb": "Technology",
  "git": "Technology",
  "rust": "Technology",
  "go": "Technology",
  "golang": "Technology",
  "docker": "Technology",
  "kubernetes": "Technology",
  "aws": "Technology",
  "linux": "Technology",
  
  "figma": "Design",
  "ui/ux": "Design",
  "graphic design": "Design",
  "painting": "Design",
  "drawing": "Design",
  "design": "Design",
  
  "marketing": "Marketing",
  "seo": "Marketing",
  "copywriting": "Marketing",
  "social media": "Marketing",
  
  "guitar": "Music",
  "piano": "Music",
  "singing": "Music",
  "drums": "Music",
  "music theory": "Music",
  
  "french": "Languages",
  "spanish": "Languages",
  "english": "Languages",
  "german": "Languages",
  
  "photography": "Photography",
  "video editing": "Photography",
  
  "public speaking": "Business",
  "writing": "Business",
  "business strategy": "Business",
  "finance": "Business"
};

// Migrate Existing Skills in db.json to include categories
function migrateSkillsDb() {
  const db = readDb();
  let modified = false;
  
  if (!db.skills) {
    db.skills = [];
    modified = true;
  }
  
  db.skills.forEach(s => {
    const nameLower = s.name.toLowerCase();
    const targetCategory = PRESET_SKILL_CATEGORIES[nameLower] || "Technology";
    if (s.category !== targetCategory) {
      s.category = targetCategory;
      modified = true;
    }
  });
  
  if (modified) {
    console.log("Migrating skills database to include categories...");
    writeDb(db);
  }
}

// Dynamically register custom user skills to the global catalog
function registerNewSkills(skillsList, db) {
  if (!skillsList || !Array.isArray(skillsList)) return;
  
  const LEVEL_WEIGHTS = { Easy: 1, Medium: 2, Advanced: 3 };
  
  skillsList.forEach(item => {
    if (!item || !item.skill) return;
    const skillName = item.skill.trim();
    const skillNameLower = skillName.toLowerCase();
    
    // Determine category: preset check, otherwise keep user provided or default
    let category = item.category || "Technology";
    if (PRESET_SKILL_CATEGORIES[skillNameLower]) {
      category = PRESET_SKILL_CATEGORIES[skillNameLower];
    }
    
    // Explicitly update category on the list item itself
    item.category = category;
    
    // Check if skill exists in db.skills
    const exists = db.skills.some(s => s.name.toLowerCase() === skillNameLower);
    if (!exists) {
      db.skills.push({
        name: skillName,
        level: item.level || "Medium",
        weight: LEVEL_WEIGHTS[item.level || "Medium"] || 2,
        category: category
      });
    }
  });
}

// Check skills database initialization
initializeMockUsers();
migrateSkillsDb();

// ==========================================
// Authentication APIs
// ==========================================

// Register User
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  const db = readDb();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  const { salt, hash } = hashPassword(password);
  const newUser = {
    email: email.toLowerCase(),
    name,
    salt,
    passwordHash: hash,
    offer: [],
    want: [],
    bio: "",
    rating: 5.0,
    completedExchanges: 0,
    badges: [],
    reviews: []
  };

  db.users.push(newUser);
  writeDb(db);

  // Return session details (excluding security credentials)
  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
    offer: [],
    want: [],
    bio: "",
    rating: 5.0,
    completedExchanges: 0,
    badges: [],
    reviews: []
  });
});

// Login User
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const isMatch = verifyPassword(password, user.salt, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  res.json({
    email: user.email,
    name: user.name,
    offer: user.offer,
    want: user.want,
    bio: user.bio,
    rating: user.rating || 5.0,
    completedExchanges: user.completedExchanges || 0,
    badges: user.badges || [],
    reviews: user.reviews || []
  });
});

// ==========================================
// Profile Management API
// ==========================================
app.post("/api/users/profile", (req, res) => {
  const { email, offer, want, bio } = req.body;
  if (!email) {
    return res.status(400).json({ error: "User email is required" });
  }

  const db = readDb();
  const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // Register any new dynamic skills to catalog & enrich payload with categories
  const enrichedOffer = offer || [];
  const enrichedWant = want || [];
  registerNewSkills(enrichedOffer, db);
  registerNewSkills(enrichedWant, db);

  // Update fields
  db.users[userIndex].offer = enrichedOffer;
  db.users[userIndex].want = enrichedWant;
  db.users[userIndex].bio = bio || "";

  writeDb(db);

  res.json({
    email: db.users[userIndex].email,
    name: db.users[userIndex].name,
    offer: db.users[userIndex].offer,
    want: db.users[userIndex].want,
    bio: db.users[userIndex].bio,
    rating: db.users[userIndex].rating || 5.0,
    completedExchanges: db.users[userIndex].completedExchanges || 0,
    badges: db.users[userIndex].badges || [],
    reviews: db.users[userIndex].reviews || []
  });
});

// Get Standard Skills Catalog
app.get("/api/skills", (req, res) => {
  const db = readDb();
  res.json(db.skills || []);
});

// Get All Users (except the requesting user)
app.get("/api/users", (req, res) => {
  const { exclude } = req.query;
  const db = readDb();
  let usersList = db.users || [];
  if (exclude) {
    usersList = usersList.filter(u => u.email.toLowerCase() !== exclude.toLowerCase());
  }
  
  // Format user list securely (excluding salt and password hash)
  const formattedUsers = usersList.map(u => ({
    email: u.email,
    name: u.name,
    offer: u.offer,
    want: u.want,
    bio: u.bio,
    rating: u.rating || 5.0,
    completedExchanges: u.completedExchanges || 0,
    badges: u.badges || [],
    reviews: u.reviews || []
  }));
  res.json(formattedUsers);
});

// ==========================================
// Cosine Similarity Matching Engine
// ==========================================
app.get("/api/users/matches", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "User email is required" });
  }

  const db = readDb();
  const currentUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // Define skill levels weights
  const LEVEL_WEIGHTS = { Easy: 1, Medium: 2, Advanced: 3 };

  // Calculate unique list of all skills defined in user profiles or standard catalog
  const allSkillsSet = new Set();
  db.skills.forEach(s => allSkillsSet.add(s.name.toLowerCase()));
  db.users.forEach(u => {
    u.offer.forEach(s => allSkillsSet.add(s.skill.toLowerCase()));
    u.want.forEach(s => allSkillsSet.add(s.skill.toLowerCase()));
  });
  const allSkills = Array.from(allSkillsSet);

  // Math helper: Vector Magnitude
  const magnitude = (vec) => Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));

  // Math helper: Dot Product
  const dotProduct = (vecA, vecB) => vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);

  // Create vector for a user's skills
  const createSkillVector = (skillList) => {
    const vec = new Array(allSkills.length).fill(0);
    skillList.forEach(item => {
      const idx = allSkills.indexOf(item.skill.toLowerCase());
      if (idx !== -1) {
        vec[idx] = LEVEL_WEIGHTS[item.level] || 1;
      }
    });
    return vec;
  };

  const uOfferVec = createSkillVector(currentUser.offer);
  const uWantVec = createSkillVector(currentUser.want);
  const uOfferMag = magnitude(uOfferVec);
  const uWantMag = magnitude(uWantVec);

  const matchedUsers = [];

  db.users.forEach(otherUser => {
    // Skip self
    if (otherUser.email.toLowerCase() === currentUser.email.toLowerCase()) return;

    const oOfferVec = createSkillVector(otherUser.offer);
    const oWantVec = createSkillVector(otherUser.want);
    const oOfferMag = magnitude(oOfferVec);
    const oWantMag = magnitude(oWantVec);

    // 1. Cosine similarity: does what otherUser offers align with what currentUser wants?
    let simOtherToCurrent = 0;
    if (oOfferMag > 0 && uWantMag > 0) {
      simOtherToCurrent = dotProduct(oOfferVec, uWantVec) / (oOfferMag * uWantMag);
    }

    // 2. Cosine similarity: does what currentUser offers align with what otherUser wants?
    let simCurrentToOther = 0;
    if (uOfferMag > 0 && oWantMag > 0) {
      simCurrentToOther = dotProduct(uOfferVec, oWantVec) / (uOfferMag * oWantMag);
    }

    // Combine into a compatibility index (average of both alignments)
    const compatibilityScore = (simOtherToCurrent + simCurrentToOther) / 2;

    // Only return matching users with some degree of relevance (score > 0)
    if (compatibilityScore > 0) {
      let matchType = "Direct";
      if (simOtherToCurrent > 0 && simCurrentToOther > 0) {
        matchType = "Mutual";
      }

      // Compute skill exchange compensation details
      // Alice's weight taught to Bob
      let currentTaughtWeight = 0;
      currentUser.offer.forEach(off => {
        const wantsThis = otherUser.want.some(w => w.skill.toLowerCase() === off.skill.toLowerCase());
        if (wantsThis) {
          currentTaughtWeight += LEVEL_WEIGHTS[off.level] || 1;
        }
      });

      // Bob's weight taught to Alice
      let otherTaughtWeight = 0;
      otherUser.offer.forEach(off => {
        const wantsThis = currentUser.want.some(w => w.skill.toLowerCase() === off.skill.toLowerCase());
        if (wantsThis) {
          otherTaughtWeight += LEVEL_WEIGHTS[off.level] || 1;
        }
      });

      // Compensation calculation (₹10 per level difference)
      const levelDiff = currentTaughtWeight - otherTaughtWeight;
      let compensationText = "";
      let compensationValue = 0;
      let payTo = null; // Who needs to pay

      if (levelDiff > 0) {
        compensationValue = levelDiff * 10;
        payTo = currentUser.name;
        compensationText = `${otherUser.name} pays you ₹${compensationValue.toFixed(2)} (You are teaching a higher level)`;
      } else if (levelDiff < 0) {
        compensationValue = Math.abs(levelDiff) * 10;
        payTo = otherUser.name;
        compensationText = `You pay ${otherUser.name} ₹${compensationValue.toFixed(2)} (They are teaching a higher level)`;
      } else {
        compensationText = "Balanced Trade (No level compensation required)";
      }

      matchedUsers.push({
        email: otherUser.email,
        name: otherUser.name,
        offer: otherUser.offer,
        want: otherUser.want,
        bio: otherUser.bio,
        rating: otherUser.rating || 5.0,
        completedExchanges: otherUser.completedExchanges || 0,
        badges: otherUser.badges || [],
        reviews: otherUser.reviews || [],
        score: Math.round(compatibilityScore * 100),
        matchType,
        compensation: {
          text: compensationText,
          value: compensationValue,
          payTo,
          levelDiff
        }
      });
    }
  });

  // Sort by compatibility score descending
  matchedUsers.sort((a, b) => b.score - a.score);

  res.json(matchedUsers);
});

// ==========================================
// User Reviews & Ratings API
// ==========================================
app.post("/api/users/review", (req, res) => {
  const { email, reviewerName, reviewerEmail, rating, comment } = req.body;
  if (!email || !reviewerName || !reviewerEmail || rating === undefined || !comment) {
    return res.status(400).json({ error: "Missing required review details" });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Create review object
  const newReview = {
    id: "rev_" + Date.now(),
    reviewerName,
    reviewerEmail: reviewerEmail.toLowerCase(),
    rating: parseFloat(rating),
    comment: comment.trim(),
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  };

  user.reviews = user.reviews || [];
  user.reviews.push(newReview);

  // Recalculate average rating
  const totalRating = user.reviews.reduce((sum, r) => sum + r.rating, 0);
  user.rating = Math.round((totalRating / user.reviews.length) * 10) / 10;

  // Increment completed exchanges
  user.completedExchanges = (user.completedExchanges || 0) + 1;

  // Dynamic Badge Assignment
  user.badges = user.badges || [];
  
  if (user.completedExchanges >= 1 && !user.badges.includes("First Barter")) {
    user.badges.push("First Barter");
  }
  if (user.completedExchanges >= 3 && !user.badges.includes("Skill Maestro")) {
    user.badges.push("Skill Maestro");
  }
  if (user.completedExchanges >= 10 && !user.badges.includes("Trusted Trader")) {
    user.badges.push("Trusted Trader");
  }
  if (user.rating >= 4.7 && user.completedExchanges >= 5 && !user.badges.includes("Top Mentor")) {
    user.badges.push("Top Mentor");
  }

  writeDb(db);

  res.json({
    email: user.email,
    name: user.name,
    offer: user.offer,
    want: user.want,
    bio: user.bio,
    rating: user.rating,
    completedExchanges: user.completedExchanges,
    badges: user.badges,
    reviews: user.reviews
  });
});

// ==========================================
// Skills Request Board APIs
// ==========================================
app.get("/api/requests", (req, res) => {
  const db = readDb();
  // Return requests, newest first
  const sortedRequests = [...(db.requests || [])].reverse();
  res.json(sortedRequests);
});

app.post("/api/requests/create", (req, res) => {
  const { userEmail, userName, needSkill, needLevel, needCategory, offerSkill, offerLevel, offerCategory, description } = req.body;
  if (!userEmail || !userName || !needSkill || !needLevel || !offerSkill || !offerLevel || !description) {
    return res.status(400).json({ error: "Please enter all request details" });
  }

  const db = readDb();
  const newRequest = {
    id: "req_" + Date.now(),
    userEmail: userEmail.toLowerCase(),
    userName,
    needSkill,
    needLevel,
    needCategory: needCategory || "Technology",
    offerSkill,
    offerLevel,
    offerCategory: offerCategory || "Technology",
    description: description.trim(),
    dateStr: new Date().toLocaleDateString([], { month: "short", day: "numeric" }) + " at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  db.requests = db.requests || [];
  db.requests.push(newRequest);
  writeDb(db);

  res.status(201).json(newRequest);
});

// ==========================================
// Tinder Swipe Feed Discovery API
// ==========================================
app.get("/api/users/swipe-feed", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "User email is required" });
  }

  const db = readDb();
  const currentUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // 1. Find all users we already have chats with
  const userEmail = email.toLowerCase();
  const activeContacts = new Set();
  
  (db.messages || []).forEach(m => {
    if (m.from.toLowerCase() === userEmail) {
      activeContacts.add(m.to.toLowerCase());
    } else if (m.to.toLowerCase() === userEmail) {
      activeContacts.add(m.from.toLowerCase());
    } else if (m.systemFor && m.systemFor.includes(userEmail)) {
      m.systemFor.forEach(e => {
        if (e !== userEmail) activeContacts.add(e.toLowerCase());
      });
    }
  });

  // 2. Filter discovery feed: exclude self and active chats
  const swipeFeedList = (db.users || []).filter(u => 
    u.email.toLowerCase() !== userEmail &&
    !activeContacts.has(u.email.toLowerCase())
  );

  // 3. Compute skill level weights & vector similarity score for each candidate in the feed
  const LEVEL_WEIGHTS = { Easy: 1, Medium: 2, Advanced: 3 };
  
  const allSkillsSet = new Set();
  db.skills.forEach(s => allSkillsSet.add(s.name.toLowerCase()));
  db.users.forEach(u => {
    u.offer.forEach(s => allSkillsSet.add(s.skill.toLowerCase()));
    u.want.forEach(s => allSkillsSet.add(s.skill.toLowerCase()));
  });
  const allSkills = Array.from(allSkillsSet);

  const magnitude = (vec) => Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  const dotProduct = (vecA, vecB) => vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);

  const createSkillVector = (skillList) => {
    const vec = new Array(allSkills.length).fill(0);
    skillList.forEach(item => {
      const idx = allSkills.indexOf(item.skill.toLowerCase());
      if (idx !== -1) {
        vec[idx] = LEVEL_WEIGHTS[item.level] || 1;
      }
    });
    return vec;
  };

  const uOfferVec = createSkillVector(currentUser.offer);
  const uWantVec = createSkillVector(currentUser.want);
  const uOfferMag = magnitude(uOfferVec);
  const uWantMag = magnitude(uWantVec);

  const formattedSwipeFeed = swipeFeedList.map(otherUser => {
    const oOfferVec = createSkillVector(otherUser.offer);
    const oWantVec = createSkillVector(otherUser.want);
    const oOfferMag = magnitude(oOfferVec);
    const oWantMag = magnitude(oWantVec);

    // Calculate match alignments
    let simOtherToCurrent = 0;
    if (oOfferMag > 0 && uWantMag > 0) {
      simOtherToCurrent = dotProduct(oOfferVec, uWantVec) / (oOfferMag * uWantMag);
    }

    let simCurrentToOther = 0;
    if (uOfferMag > 0 && oWantMag > 0) {
      simCurrentToOther = dotProduct(uOfferVec, oWantVec) / (uOfferMag * oWantMag);
    }

    const compatibilityScore = (simOtherToCurrent + simCurrentToOther) / 2;
    const matchScore = Math.max(10, Math.round(compatibilityScore * 100)); // Default to at least 10% compatibility for baseline discovery

    return {
      email: otherUser.email,
      name: otherUser.name,
      offer: otherUser.offer || [],
      want: otherUser.want || [],
      bio: otherUser.bio || "",
      rating: otherUser.rating || 5.0,
      completedExchanges: otherUser.completedExchanges || 0,
      badges: otherUser.badges || [],
      reviews: otherUser.reviews || [],
      score: matchScore
    };
  });

  // Sort candidates by compatibility score descending
  formattedSwipeFeed.sort((a, b) => b.score - a.score);

  res.json(formattedSwipeFeed);
});

// ==========================================
// Chat and Deal APIs
// ==========================================

// Get message history between two users
app.get("/api/chats/messages", (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "Missing sender or recipient details" });
  }

  const db = readDb();
  const f = from.toLowerCase();
  const t = to.toLowerCase();

  const chatMessages = db.messages.filter(
    m => (m.from.toLowerCase() === f && m.to.toLowerCase() === t) ||
         (m.from.toLowerCase() === t && m.to.toLowerCase() === f) ||
         (m.type === "system" && m.systemFor && m.systemFor.includes(f) && m.systemFor.includes(t))
  );

  // Hydrate messages with deal details if any deal is attached
  const hydratedMessages = chatMessages.map(m => {
    if (m.dealId) {
      const deal = db.deals.find(d => d.id === m.dealId);
      return { ...m, deal };
    }
    return m;
  });

  res.json(hydratedMessages);
});

// Send Chat Message or Propose Barter Deal
app.post("/api/chats/send", (req, res) => {
  const { from, to, text, type, deal } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: "Missing sender or recipient details" });
  }

  const db = readDb();
  let dealId = null;

  // Handle Proposing a Barter Deal
  if (type === "deal" && deal) {
    dealId = "deal_" + Date.now();
    const newDeal = {
      id: dealId,
      proposer: from,
      receiver: to,
      skillOffered: deal.skillOffered,
      skillOfferedLevel: deal.skillOfferedLevel,
      skillWanted: deal.skillWanted,
      skillWantedLevel: deal.skillWantedLevel,
      compensation: parseFloat(deal.compensation) || 0,
      status: "pending"
    };
    db.deals.push(newDeal);
  }

  const newMessage = {
    id: "msg_" + Date.now(),
    from,
    to,
    text: text || "",
    type: type || "text",
    dealId,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  db.messages.push(newMessage);
  writeDb(db);

  // Return the newly created message (hydrated if deal was added)
  if (dealId) {
    const proposedDeal = db.deals.find(d => d.id === dealId);
    return res.status(201).json({ ...newMessage, deal: proposedDeal });
  }

  res.status(201).json(newMessage);
});

// Accept or Decline a Barter Deal
app.post("/api/chats/deal/update", (req, res) => {
  const { dealId, status, userEmail } = req.body;
  if (!dealId || !status || !userEmail) {
    return res.status(400).json({ error: "Missing required deal details" });
  }

  if (status !== "accepted" && status !== "declined") {
    return res.status(400).json({ error: "Invalid deal status status" });
  }

  const db = readDb();
  const dealIndex = db.deals.findIndex(d => d.id === dealId);
  if (dealIndex === -1) {
    return res.status(404).json({ error: "Barter deal not found" });
  }

  const deal = db.deals[dealIndex];
  if (deal.receiver.toLowerCase() !== userEmail.toLowerCase()) {
    return res.status(403).json({ error: "Only the recipient can accept or decline this deal" });
  }

  // Update deal status
  db.deals[dealIndex].status = status;

  // Add an automated system message notifying the chat of the update
  const systemUser = db.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
  const userName = systemUser ? systemUser.name : "User";
  const systemMsg = {
    id: "msg_sys_" + Date.now(),
    from: "system",
    to: deal.proposer, // Or broadcast to chat, will filter by conversations anyway
    // Create dual direction messaging visibility
    fromSystem: true,
    chatPair: [deal.proposer.toLowerCase(), deal.receiver.toLowerCase()],
    text: `🤝 Barter deal has been ${status.toUpperCase()} by ${userName}!`,
    type: "system",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  // We add this to db messages
  db.messages.push({
    id: "msg_sys_" + Date.now(),
    from: "system",
    to: deal.proposer,
    // Add special markers so it is visible to both
    systemFor: [deal.proposer.toLowerCase(), deal.receiver.toLowerCase()],
    text: `🤝 Barter deal has been ${status.toUpperCase()} by ${userName}!`,
    type: "system",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  writeDb(db);

  res.json({ success: true, deal: db.deals[dealIndex] });
});

// Retrieve Active Conversations List (Users we have messages with)
app.get("/api/chats/active", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "User email is required" });
  }

  const db = readDb();
  const userEmail = email.toLowerCase();
  
  // Find all distinct emails the user has chatted with
  const activeEmailsSet = new Set();
  
  db.messages.forEach(m => {
    if (m.from.toLowerCase() === userEmail) {
      activeEmailsSet.add(m.to.toLowerCase());
    } else if (m.to.toLowerCase() === userEmail) {
      activeEmailsSet.add(m.from.toLowerCase());
    } else if (m.systemFor && m.systemFor.includes(userEmail)) {
      m.systemFor.forEach(e => {
        if (e !== userEmail) activeEmailsSet.add(e);
      });
    }
  });

  // Hydrate email list with user profiles
  const activeChats = [];
  activeEmailsSet.forEach(e => {
    const contact = db.users.find(u => u.email.toLowerCase() === e);
    if (contact) {
      activeChats.push({
        email: contact.email,
        name: contact.name,
        offer: contact.offer,
        want: contact.want,
        bio: contact.bio
      });
    }
  });

  res.json(activeChats);
});

// ==========================================
// Community Forum Hub APIs (Reddit/LeetCode Style)
// ==========================================

// Get All Forum Posts
app.get("/api/posts", (req, res) => {
  const db = readDb();
  const posts = db.posts || [];
  // Sort posts: newest first
  const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
  res.json(sortedPosts);
});

// Create Forum Post
app.post("/api/posts/create", (req, res) => {
  const { title, content, tag, authorEmail, authorName } = req.body;
  if (!title || !content || !tag || !authorEmail || !authorName) {
    return res.status(400).json({ error: "Please fill in all post details" });
  }

  const db = readDb();
  const newPost = {
    id: "post_" + Date.now(),
    title,
    content,
    tag,
    authorEmail: authorEmail.toLowerCase(),
    authorName,
    likes: [],
    comments: [],
    timestamp: Date.now(),
    dateStr: new Date().toLocaleDateString([], { month: "short", day: "numeric" }) + " at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  db.posts = db.posts || [];
  db.posts.push(newPost);
  writeDb(db);

  res.status(201).json(newPost);
});

// Like/Upvote Forum Post
app.post("/api/posts/like", (req, res) => {
  const { postId, email } = req.body;
  if (!postId || !email) {
    return res.status(400).json({ error: "Missing upvote references" });
  }

  const db = readDb();
  db.posts = db.posts || [];
  const postIndex = db.posts.findIndex(p => p.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Forum post not found" });
  }

  const lowerEmail = email.toLowerCase();
  const likesSet = new Set(db.posts[postIndex].likes || []);
  if (likesSet.has(lowerEmail)) {
    likesSet.delete(lowerEmail); // Toggle downvote
  } else {
    likesSet.add(lowerEmail); // Toggle upvote
  }

  db.posts[postIndex].likes = Array.from(likesSet);
  writeDb(db);

  res.json(db.posts[postIndex]);
});

// Comment on Forum Post
app.post("/api/posts/comment", (req, res) => {
  const { postId, email, text, authorName } = req.body;
  if (!postId || !email || !text || !authorName) {
    return res.status(400).json({ error: "Please enter your comment text" });
  }

  const db = readDb();
  db.posts = db.posts || [];
  const postIndex = db.posts.findIndex(p => p.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Forum post not found" });
  }

  const newComment = {
    id: "cmt_" + Date.now(),
    authorEmail: email.toLowerCase(),
    authorName,
    text: text.trim(),
    timestamp: Date.now(),
    dateStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  db.posts[postIndex].comments = db.posts[postIndex].comments || [];
  db.posts[postIndex].comments.push(newComment);
  writeDb(db);

  res.status(201).json(db.posts[postIndex]);
});

// Mock Forum Seeding
function initializeMockPosts() {
  const db = readDb();
  if (db.posts && db.posts.length > 0) return;

  console.log("Initializing dynamic mock community forum posts inside posts.json...");
  
  const mockPosts = [
    {
      id: "post_init_1",
      title: "🔥 Success Story: Taught Priya C++ in exchange for Advanced UI/UX Figma Design!",
      content: "I want to share my experience bartering with Priya. I am a systems programmer and wanted to build a beautiful portfolio website. I spent 4 sessions teaching Priya memory management in C++ and basic pointer logic. In return, she completely revamped my portfolio design in Figma! It was a seamless trade, and we both leveled up our skills. This platform is amazing!",
      tag: "Success Story",
      authorEmail: "arjun@skillbarter.com",
      authorName: "Arjun",
      likes: ["priya@skillbarter.com", "sarah@skillbarter.com"],
      comments: [
        {
          id: "cmt_init_1",
          authorEmail: "priya@skillbarter.com",
          authorName: "Priya",
          text: "Arjun is a fantastic tutor! I finally understand C++ pointers. Highly recommend trading with him!",
          timestamp: Date.now() - 7200000,
          dateStr: "2 hours ago"
        }
      ],
      timestamp: Date.now() - 86400000,
      dateStr: "Yesterday at 04:30 pm"
    },
    {
      id: "post_init_2",
      title: "Seeker: 💻 Seeking Advanced Python Automation - offering SEO & Digital Marketing",
      content: "Hey community! I am running a marketing agency and spending hours copying data across trackers. I would love to learn how to write simple Python automation scripts (using pandas/requests) to automate this. In exchange, I can teach you professional SEO strategies, keyword research, and meta tags optimization that drives actual search traffic. Let's trade!",
      tag: "Skill Request",
      authorEmail: "aisha@skillbarter.com",
      authorName: "Aisha",
      likes: ["rahul@skillbarter.com"],
      comments: [],
      timestamp: Date.now() - 18000000,
      dateStr: "5 hours ago"
    }
  ];

  db.posts = mockPosts;
  writeDb(db);
  console.log("Mock posts initialized successfully in backend/databases/posts.json!");
}

// Check posts database initialization
initializeMockPosts();

// Start Server
app.listen(PORT, () => {
  console.log(`SkillBarter backend server running on http://localhost:${PORT}`);
});
