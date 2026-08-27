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
3. **Draw Tier 3 (Data)**: A wide box labeled "Storage Tier". Draw a few cylindrical shapes or small boxes representing separated JSON document collections (`users`, `deals`, `messages`, `requests`).
4. **Connect the Tiers**: Draw arrows down the middle showing **HTTP/JSON** connecting Client and App, and **Node `fs` System Calls** connecting App and Storage.

---

## 💬 Part 2: Tier Descriptions & Technical Explanations

Here is how you describe each tier to an interviewer:

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

## 🧠 Part 3: Deep Dive — The Cosine Similarity Matching Engine

This is the **"Hero Feature"** of your project. If you explain this clearly, you will stand out in any interview.

### 1. The Core Problem
How do we match Alice (who offers **React** and wants **Python**) with Bob (who offers **Python** and wants **React**)?

### 2. The Vector Space Model
We represent skills as vectors in a multi-dimensional space where each dimension is a unique skill from our platform's catalog.

Let's say our platform only has 4 skills: `[React, Python, Figma, HTML]`.
We also weigh skill levels mathematically:
*   `Easy = 1`
*   `Medium = 2`
*   `Advanced = 3`

*   **Alice's Offer Vector**: Offers React (Medium) and HTML (Easy) $\rightarrow \mathbf{A_{offer}} = [2, 0, 0, 1]$
*   **Bob's Want Vector**: Wants React (Medium) and Figma (Easy) $\rightarrow \mathbf{B_{want}} = [2, 0, 1, 0]$

### 3. The Math (Cosine Similarity)
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

### 4. Direct vs. Mutual Matching
*   **Direct Match**: Bob has a skill Alice wants, OR Alice has a skill Bob wants.
*   **Mutual Match**: Bob has a skill Alice wants, AND Alice has a skill Bob wants. 
*   *Implementation*: The backend runs the cosine similarity in both directions. If $\text{score(A\_offer, B\_want)} > 0$ and $\text{score(B\_offer, A\_want)} > 0$, the server flags it as a **Mutual Match**, which translates into high-priority matches on the user's dashboard.

---

## 🚀 Part 4: Key Interview QA Cheat Sheet

**Q: Why choose JSON files instead of MongoDB or SQL for this project?**
*   **Answer**: *"I selected flat-file JSON document storage to demonstrate low-level file I/O handling, serialization, and stream concurrency concepts. By partitioning tables into decoupled JSON files (users, messages, deals), I reduced read/write lock contention. In a standard production environment, this schema directly maps to a NoSQL document database like MongoDB/Mongoose."*

**Q: How does your messaging scale with short polling?**
*   **Answer**: *"The React client updates active chat channels using a short-polling routine executing every 2 seconds. The Express backend serves these requests statelessly. To make this production-ready for high concurrent scaling, I would transition the polling model to full bi-directional WebSockets (using `socket.io`) to enable event-driven real-time messaging with lower network overhead."*

**Q: How do you prevent users from setting fake skill levels to cheat matching?**
*   **Answer**: *"Instead of allowing users to self-evaluate difficulty levels, the application features an objective, experience-based questionnaire. The level is calculated deterministically on the server based on practice duration (e.g. <1 year vs 3+ years) and hands-on application metrics (basic exercises vs medium projects vs production scale builds). This ensures fair and balanced barter calculations."*
