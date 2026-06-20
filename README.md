# ⚡ CarbonZero — Privacy-First Carbon Footprint Tracker

> *Track your CO₂ impact. Zero surveillance. Maximum security.*

A cyberpunk/eco-themed hackathon project — a privacy-first carbon footprint tracker with real-time anti-cheat security monitoring.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background (Void) | `#0A0E17` |
| Primary Accent (Cyan) | `#00F0FF` |
| Positive Action (Toxic Green) | `#39FF14` |
| Security Alerts (Hacker Pink) | `#FF0055` |
| Glass Cards | `rgba(255,255,255,0.03)` + `backdrop-blur` |
| Font (Display) | Space Grotesk / Rajdhani |
| Font (Terminal) | Roboto Mono |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | Motion v12 (`motion/react`) — spring physics |
| Data Viz | Recharts — neon donut chart |
| Icons | Lucide React |
| Backend | Python FastAPI |
| Database | SQLite (aiosqlite) / PostgreSQL |
| Deployment | Google Cloud Run (single-container) |

---

## 🚀 Getting Started

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── GlassCard.jsx        # Reusable floating glassmorphism card
│   ├── NeonButton.jsx       # Spring-physics button (cyan/toxic/hacker/ghost)
│   ├── TopBar.jsx           # Navigation + security status badge
│   ├── CarbonDashboard.jsx  # Left panel: CO2 score, donut chart, eco-actions
│   └── SecurityConsole.jsx  # Right panel: live threat monitoring terminal
├── App.jsx                  # Root layout & routing
├── main.jsx                 # React entry point
└── index.css                # Global CSS + Tailwind v4 theme tokens
backend/
├── main.py                  # FastAPI Entrypoint
├── database.py              # SQLite Database setup
├── routes/                  # API endpoints
```

---

## 🔐 Security Architecture

```
[User Input: Raw Lifestyle Data] ──> (Calculated Client-Side / localStorage)
                                              │
                              (Only CO2 Score Transmitted)
                                              │
                                              ▼
[Secure Gateway Middleware] ────────> [Anti-Cheat Engine]
(JWT HTTP-only cookies)               (Rate-limit: 5req/min/IP)
(Sliding-window rate limiter)         (Anomaly: reject >50kg/tx)
                                              │
                                              ▼
                              [Anonymized Database] ──> [Leaderboard]
```

---

## 📋 Phase Roadmap

- [x] **Phase 1**: Foundation layout, design system, glassmorphism UI, security terminal
- [x] **Phase 2**: Onboarding wizard (3-stage form), heuristic CO2 calculator
- [x] **Phase 3**: FastAPI backend, JWT auth, rate limiting, Database
- [x] **Phase 4**: Server-Sent Events (SSE) real-time security log streaming, leaderboard
- [ ] **Phase 5**: Docker containerization, Cloud Run deployment

---

## 📄 License

MIT — Built for the PromptWars Hackathon Challenge.
