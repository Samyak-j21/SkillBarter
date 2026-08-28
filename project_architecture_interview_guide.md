# Project Architecture Interview Guide: SkillBarter

This guide provides a systematic, clear, and whiteboard-friendly architecture diagram designed for pen-and-paper drawing during technical interviews. It includes professional descriptions, structural workflows, and strategic talking points to help you showcase your engineering decisions confidently.

---

## 🎨 Part 1: Whiteboard Architecture (Pen & Paper Friendly)

Draw this **3-Tier Architecture** on a whiteboard. Use clean blocks and clear arrows to show how data flows from the user's device down to the files on disk.

```
       +-----------------------------------------------------------+
       |                  1. CLIENT TIER (React)                   |
       |                                                           |
       |  +--------------------+         +----------------------+  |
       |  |  Routing & Views   | <=====> |   Local State / LS   |  |
       |  |  (React Router)    |         |   (Theme, Session)   |  |
       |  +--------------------+         +----------------------+  |
       +-----------------------------------------------------------+
                                     |
                                     |  HTTP REST / JSON
                                     v
       +-----------------------------------------------------------+
       |               2. APPLICATION TIER (Express)               |
       |                                                           |
       |  +--------------------+         +----------------------+  |
       |  |   API Controllers  | <=====> | Vector Match Engine  |  |
       |  |   (Auth, Profiles) |         | (Cosine Similarity)  |  |
       |  +--------------------+         +----------------------+  |
       +-----------------------------------------------------------+
                                     |
                                     |  Node fs (I/O Read/Write)
                                     v
       +-----------------------------------------------------------+
       |               3. DATA TIER (Decoupled JSON)               |
       |                                                           |
       |  +------------+  +------------+  +------------+  +-----+  |
       |  | users.json |  | deals.json |  | messages.  |  | ... |  |
       |  +------------+  +------------+  +------------+  +-----+  |
       +-----------------------------------------------------------+
```

### ✏️ Whiteboard Drawing Strategy (How to draw it step-by-step):
1. **Draw Tier 1 (Client)**: A single wide box labeled "Client Tier". Draw two boxes inside: one for "UI Views (React SPA)" and one for "Local State (`localStorage`)".
2. **Draw Tier 2 (Application)**: A wide box labeled "App Tier". Draw two boxes inside: "REST API Controllers (Express)" and "Similarity Vector Engine".
3. **Draw Tier 3 (Data)**: A wide box labeled "Storage Tier". Draw a few cylindrical shapes or small boxes representing separated JSON document collections (`users`, `deals`, `messages`, `requests`, `skills`, `posts`).
4. **Connect the Tiers**: Draw arrows down the middle showing **HTTP/JSON** connecting Client and App, and **Node `fs` System Calls** connecting App and Storage.

---

## 💬 Part 2: Tier Descriptions & Technical Explanations

### 1. Client Tier (React SPA)
*   **Role**: Handles user interaction, rendering, client-side routing, and session state.
*   **Interviewer Pitch**: 
    > *"I designed the client as a responsive Single Page Application using React and Vite. Routing is handled on the client using React Router, with a fallback redirect rule defined in `vercel.json` to rewrite routes back to `index.html` on production. User sessions are persisted locally using `localStorage` to reduce API calls on page refreshes, and the UI uses native CSS variables mapping to a warm-dim palette to reduce eye strain."*

### 2. Application Tier (Node.js & Express.js)
*   **Role**: Handles routing, API controllers, secure cryptographic routines, and the compatibility matching engine.
*   **Interviewer Pitch**:
    > *"The backend is a Node.js Express server acting as a stateless API service. It exposes RESTful routes for authentication, user profiles, request boards, and negotiation channels. For authentication, instead of storing passwords, the application leverages custom cryptographic utilities using Node's native `crypto` module, generating random salts and running SHA-512 hashes to prevent rainbow table attacks."*

### 3. Data Tier (Decoupled JSON File Databases)
*   **Role**: Persists structured platform data.
*   **Interviewer Pitch**:
    > *"For storage, I designed a decoupled JSON flat-file database system where data is split by domain (users, deals, messages, etc.). Each table behaves like a document collection. I chose to decouple the unified `db.json` into separate entity-specific JSON files to avoid file locking issues, decrease memory footprints during reads, and improve Write throughput when multiple clients access different endpoints."*

---

## 🧮 Part 3: Deep Dive — Udemy-Inspired Intermediary Pricing Math

This is a **critical core business feature** showing how the system acts as a fair, objective intermediator for skills exchange, balancing trade imbalances using cash compensations.

### 1. The Dynamic Pricing Model
Each skill is assigned a monetary valuation computed from its **Base Category Rate** and its **Difficulty Level Multiplier**:

#### Category Base Prices (₹):
*   💻 **Technology**: ₹450
*   💼 **Business**: ₹400
*   🎨 **Design**: ₹350
*   📈 **Marketing**: ₹300
*   📸 **Photography**: ₹250
*   🎵 **Music**: ₹250
*   🌐 **Languages**: ₹200
*   *Default*: ₹250

#### Level Multipliers:
*   **Easy** (Level 1): `1.0x` multiplier
*   **Medium** (Level 2): `1.5x` multiplier
*   **Advanced** (Level 3): `2.5x` multiplier

$$\text{Skill Value} = \text{Base Price} \times \text{Level Multiplier}$$

---

### 2. The Compensation Formula
When User A proposes to teach User B Skill $S_A$ at Level $L_A$ in exchange for User B teaching Skill $S_B$ at Level $L_B$:

$$\text{Value of Alice's Teaching}\ (V_A) = \text{BasePrice}(S_A) \times \text{Multiplier}(L_A)$$
$$\text{Value of Bob's Teaching}\ (V_B) = \text{BasePrice}(S_B) \times \text{Multiplier}(L_B)$$
$$\text{Net Difference}\ (D) = V_A - V_B$$

#### Output States:
1.  **Balanced Exchange ($D = 0$)**: The values match. The cash adjustment defaults to **₹0 (Nullified)**.
2.  **Bob pays Alice ($D > 0$)**: Alice's skill has higher value. Bob compensates Alice with **₹D**.
3.  **Alice pays Bob ($D < 0$)**: Bob's skill has higher value. Alice compensates Bob with **₹|D|**.

*Interviewer Note*: This is dynamically calculated on the fly as inputs change inside the propose barter drawer UI. The recommended amount is auto-selected, but the input field remains editable, allowing users to override and negotiate custom amounts (Bargaining).

---

## 🧠 Part 4: Deep Dive — Cosine Similarity Matching Engine

This is the **"Vector Search"** compatibility feature. If you explain this clearly, you will stand out in any interview.

### 1. The Vector Space Model
We represent user portfolios as vectors in a multi-dimensional space where each dimension is a unique skill from our platform's 1010+ catalog.

Let's say our platform only has 4 skills: `[React, Python, Figma, HTML]`.
We also weigh skill levels mathematically:
*   `Easy = 1`
*   `Medium = 2`
*   `Advanced = 3`

*   **Alice's Offer Vector**: Offers React (Medium) and HTML (Easy) $\rightarrow \mathbf{A_{offer}} = [2, 0, 0, 1]$
*   **Bob's Want Vector**: Wants React (Medium) and Figma (Easy) $\rightarrow \mathbf{B_{want}} = [2, 0, 1, 0]$

### 2. The Math (Cosine Similarity)
To find how well Bob's wants align with Alice's offers, we calculate the angle $\theta$ between their vectors. A cosine value of `1.0` means perfect directional alignment (perfect match), and `0.0` means complete orthogonal separation (no shared skills).

$$\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

*   **Numerator (Dot Product)**: 
    $$\mathbf{A} \cdot \mathbf{B} = (2 \times 2) + (0 \times 0) + (0 \times 1) + (1 \times 0) = 4$$
*   **Denominator (Magnitudes Product)**:
    $$\|\mathbf{A}\| = \sqrt{2^2 + 0^2 + 0^2 + 1^2} = \sqrt{5} \approx 2.24$$
    $$\|\mathbf{B}\| = \sqrt{2^2 + 0^2 + 1^2 + 0^2} = \sqrt{5} \approx 2.24$$
    $$\text{Denominator} = 2.24 \times 2.24 = 5$$
*   **Cosine Similarity Score**: 
    $$\cos(\theta) = \frac{4}{5} = 0.80\ (80\%\ Match)$$

### 3. Direct vs. Mutual Matching
*   **Direct Match**: Bob has a skill Alice wants, OR Alice has a skill Bob wants.
*   **Mutual Match**: Bob has a skill Alice wants, AND Alice has a skill Bob wants. 
*   *Implementation*: The backend runs the cosine similarity in both directions. If $\text{score(A\_offer, B\_want)} > 0$ and $\text{score(B\_offer, A\_want)} > 0$, the server flags it as a **Mutual Match**, which translates into high-priority matches on the user's dashboard.

---

## 🚀 Part 5: Key Interview QA Cheat Sheet

**Q: Why choose JSON files instead of MongoDB or SQL for this project?**
*   **Answer**: *"I selected flat-file JSON document storage to demonstrate low-level file I/O handling, serialization, and stream concurrency concepts. By partitioning tables into decoupled JSON files (users, messages, deals), I reduced read/write lock contention. In a standard production environment, this schema directly maps to a NoSQL document database like MongoDB/Mongoose."*

**Q: How does your messaging scale with short polling?**
*   **Answer**: *"The React client updates active chat channels using a short-polling routine executing every 2 seconds. The Express backend serves these requests statelessly. To make this production-ready for high concurrent scaling, I would transition the polling model to full bi-directional WebSockets (using `socket.io`) to enable event-driven real-time messaging with lower network overhead."*

**Q: How do you prevent users from setting fake skill levels to cheat matching?**
*   **Answer**: *"Instead of allowing users to self-evaluate difficulty levels, the application features an objective, experience-based questionnaire. The level is calculated deterministically on the server based on practice duration (e.g. <1 year vs 3+ years) and hands-on application metrics (basic exercises vs medium projects vs production scale builds). This ensures fair and balanced barter calculations."*
