# ⚡ CarbonZero — Privacy-First Carbon Footprint Tracker

> *Track your CO₂ impact. Zero surveillance. Maximum security.*

A cyberpunk/eco "Anti-Gravity" themed hackathon project — a privacy-first carbon footprint tracker with real-time anti-cheat security monitoring.

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
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | Motion v12 (`motion/react`) — spring physics |
| Data Viz | Recharts — neon donut chart |
| Icons | Lucide React |
| Backend (Phase 2) | Python FastAPI |
| Database (Phase 2) | PostgreSQL |
| Deployment | Google Cloud Run (single-container) |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
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
├── App.jsx                  # Root layout (2/3 + 1/3 grid)
├── main.jsx                 # React entry point
└── index.css               # Global CSS + Tailwind v4 theme tokens
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
                              [Anonymized PostgreSQL] ──> [Leaderboard]
```

---

## 📋 Phase Roadmap

- [x] **Phase 1**: Foundation layout, design system, glassmorphism UI, security terminal
- [ ] **Phase 2**: Onboarding wizard (3-stage form), heuristic CO2 calculator
- [ ] **Phase 3**: FastAPI backend, JWT auth, rate limiting, PostgreSQL
- [ ] **Phase 4**: WebSocket real-time security log streaming, leaderboard
- [ ] **Phase 5**: Docker containerization, Cloud Run deployment

---

## 📄 License

MIT — Built for the PromptWars Hackathon Challenge.
