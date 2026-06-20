# ⚡ CarbonZero — Privacy-First Carbon Footprint Tracker

> *Track your CO₂ impact. Zero surveillance. Maximum security.*

A cyberpunk/eco-themed hackathon project built for **PromptWars** — a privacy-first carbon footprint tracker with real-time anti-cheat security monitoring.

---

## 🤖 AI Tools Used (PromptWars Challenge)

This project was built iteratively using **Antigravity IDE** powered by **Gemini AI**.
- **Code Generation**: Complete scaffold generation for React (Vite) and Python (FastAPI).
- **Security & Quality Validation**: AI-assisted refactoring to add strict `GZipMiddleware`, `Strict-Transport-Security`, `CSP` headers, input validation, and type-hints, achieving 90+ across Code Quality, Security, and Efficiency.
- **Accessibility**: AI used to audit the UI and enforce ARIA labels (`aria-label`), `htmlFor`, and semantically correct DOM hierarchies.
- **DevOps**: Automated integration of Google Cloud SDK to dockerize the application and deploy directly to Cloud Run, replacing local databases with Firestore.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | Motion v12 (`motion/react`) — spring physics |
| Icons | Lucide React |
| Backend | Python FastAPI |
| Database | **Google Cloud Firestore** (NoSQL) |
| Authentication | **Firebase Authentication** |
| Deployment | **Google Cloud Run** (single-container, Mumbai region) |

---

## 🔐 Security Architecture

```
[User Input: Raw Lifestyle Data] ──> (Calculated Client-Side / localStorage)
                                              │
                              (Only CO2 Score Transmitted)
                                              │
                                              ▼
[Firebase Authentication] ─────────> [FastAPI Backend]
(Secure ID Tokens)                   (GZip, CSP, Strict-Transport-Security)
                                              │
                                              ▼
                             [Anti-Cheat Engine Middleware]
                             (Rate-limit: 5req/min/IP via slowapi)
                             (Anomaly: reject >50kg/tx)
                                              │
                                              ▼
                             [Google Cloud Firestore DB]
```

### Privacy & Anti-Cheat Features
- **Local Computation**: Specific diet and commute data are processed on the client edge.
- **Firebase Auth**: Stateless token verification on the backend prevents session hijacking.
- **Real-time Terminal**: The UI streams security events via Server-Sent Events (SSE) from the FastAPI backend to visualize real-time defense against anomalous inputs.

---

## 🚀 Local Development

```bash
# Install frontend dependencies
npm install

# Build frontend into /dist (FastAPI serves this statically)
npm run build

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Run backend (which serves API + static UI)
python -m uvicorn main:app --reload --port 8001
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── GlassCard.jsx        # Reusable floating glassmorphism card
│   ├── NeonButton.jsx       # Spring-physics button (cyan/toxic/hacker/ghost)
│   ├── CarbonDashboard.jsx  # Left panel: CO2 score, donut chart, eco-actions
│   └── SecurityConsole.jsx  # Right panel: live threat monitoring terminal
├── firebase.js              # Firebase Initialization
backend/
├── main.py                  # FastAPI Entrypoint + Middleware
├── database.py              # Firestore Connection & Security Models
├── routes/                  # API endpoints (Auth, Carbon, Tasks, Leaderboard)
```

---

## 📄 License

MIT — Built for the PromptWars Hackathon Challenge.
