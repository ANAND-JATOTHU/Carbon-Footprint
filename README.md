# ⚡ CarbonZero — Privacy-First Carbon Footprint Tracker

> *Track your CO₂ impact. Zero surveillance. Maximum security.*

A cyberpunk/eco-themed carbon footprint tracker with real-time anti-cheat security monitoring. Built with React 19 + FastAPI, deployed on Google Cloud Run with Firebase Auth and Firestore.

**Live Demo:** [https://carbon-tracker-1055941746223.asia-south1.run.app](https://carbon-tracker-1055941746223.asia-south1.run.app)

---

## 🤖 AI Tools Used (PromptWars Challenge)

This project was built iteratively using **Antigravity IDE** powered by **Gemini AI**:

- **Code Generation**: Complete scaffold generation for React (Vite) + Python (FastAPI) full-stack architecture.
- **Security & Quality Validation**: AI-assisted refactoring to add `GZipMiddleware`, `Strict-Transport-Security`, `CSP`, `Permissions-Policy` headers, Pydantic field validators, and comprehensive type-hints.
- **Testing**: AI-generated comprehensive test suites (50+ unit tests across frontend and backend) using Vitest and Pytest.
- **Accessibility**: AI-audited UI for ARIA labels, semantic HTML, skip-navigation, keyboard accessibility, and screen reader support.
- **DevOps**: Automated Docker containerization and deployment to Google Cloud Run with cross-project Firestore access.

---

## 🛠️ Tech Stack

| Layer          | Technology                                    |
|----------------|-----------------------------------------------|
| Frontend       | React 19 + Vite 6                             |
| Styling        | Tailwind CSS v4 (CSS-first config)            |
| Animation      | Motion v12 (`motion/react`) — spring physics  |
| Icons          | Lucide React                                  |
| Charts         | Recharts v3 — interactive donut charts        |
| Backend        | Python FastAPI with Pydantic v2 validation    |
| Database       | **Google Cloud Firestore** (NoSQL)            |
| Authentication | **Firebase Authentication** (Google Sign-In)  |
| Security       | Rate limiting (SlowAPI), CSP, HSTS, anomaly detection |
| Testing        | Vitest (frontend), Pytest (backend)           |
| Deployment     | **Google Cloud Run** (Mumbai region)          |

---

## 🌍 Features

### Carbon Tracking
- **3-Question Onboarding**: Diet, transport, and home lifestyle assessment
- **IPCC-Derived Calculations**: Science-backed CO₂ emission factors
- **Daily & Yearly Views**: Toggle between kg/day and MTCO₂e/year
- **Interactive Donut Chart**: Visual breakdown by category with animations

### Eco-Actions
- **8 Predefined Actions**: Log real-world eco-friendly activities
- **Custom Task Logging**: Create personalized tasks with CO₂ tracking
- **Real-time Dashboard Sync**: Instant updates when actions are logged

### Community
- **Privacy-First Leaderboard**: Anonymous display names, no PII exposed
- **Top 50 Rankings**: Sorted by lowest CO₂ emissions
- **Demo Users**: Pre-seeded data for immediate community engagement

### Security
- **Rate Limiting**: 5 requests/minute per IP (SlowAPI sliding window)
- **Anomaly Detection**: Rejects CO₂ claims > 50kg per transaction
- **Security Headers**: HSTS, CSP, X-Frame-Options, Referrer-Policy
- **Real-time Security Console**: SSE-powered live threat monitoring

---

## 🔐 Security Architecture

```
[User Input: Lifestyle Data] ──→ (Calculated Client-Side)
                                          │
                          (Only CO₂ Score Transmitted)
                                          │
                                          ▼
[Firebase Auth] ─────────────→ [FastAPI Backend]
(Stateless ID Tokens)          (GZip, CSP, HSTS, Rate-Limit)
                                          │
                                          ▼
                         [Anti-Cheat Engine Middleware]
                         (Rate-limit: 5req/min via SlowAPI)
                         (Anomaly: reject >50kg/transaction)
                         (Input validation: Pydantic v2)
                                          │
                                          ▼
                         [Google Cloud Firestore]
                         (Encrypted at rest + in transit)
```

---

## 🧪 Testing

### Frontend Tests (Vitest)
```bash
npm test
```
- **50+ unit tests** across 6 test files
- Component tests (NeonButton, GlassCard)
- Utility tests (calculateCO2 engine)
- Integration tests (App rendering, API client structure)
- Full accessibility verification

### Backend Tests (Pytest)
```bash
cd backend && python -m pytest tests/ -v
```
- **40+ unit tests** across 3 test files
- CO₂ calculation correctness and edge cases
- Pydantic model validation (SubmitBody, CreateTaskBody)
- Emission factor ordering and integrity
- Display name generation
- EventBroadcaster pub/sub logic

---

## 🚀 Local Development

```bash
# 1. Install frontend dependencies
npm install

# 2. Build frontend into /dist
npm run build

# 3. Install backend dependencies
cd backend
pip install -r requirements.txt

# 4. Run backend (serves API + static UI)
python -m uvicorn main:app --reload --port 8001

# 5. Run tests
npm test                    # Frontend
python -m pytest tests/ -v  # Backend
```

---

## 📁 Project Structure

```
├── index.html               # Entry point with SEO & skip-nav accessibility
├── src/
│   ├── App.jsx              # Root router with protected routes
│   ├── App.test.jsx         # Integration tests
│   ├── api/
│   │   ├── client.js        # Typed fetch wrapper for FastAPI
│   │   └── client.test.js   # API structure tests
│   ├── components/
│   │   ├── CarbonChart.jsx  # Donut chart with daily/yearly toggle
│   │   ├── GlassCard.jsx    # Glassmorphism card with spring physics
│   │   ├── GlassCard.test.jsx
│   │   ├── NeonButton.jsx   # Animated button (4 variants)
│   │   ├── NeonButton.test.jsx
│   │   ├── OnboardingWizard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── TaskForm.jsx
│   │   └── TopBar.jsx       # Navigation with responsive design
│   ├── context/
│   │   └── AppContext.jsx   # Global auth + user state
│   ├── pages/
│   │   ├── AboutPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── EcoActionsPage.jsx
│   │   ├── LeaderboardPage.jsx
│   │   └── LoginPage.jsx
│   └── utils/
│       ├── calculateCO2.js      # IPCC-derived emission engine
│       └── calculateCO2.test.js # 20+ calculation tests
├── backend/
│   ├── main.py              # FastAPI entry + security middleware
│   ├── auth.py              # Firebase token verification
│   ├── broadcaster.py       # SSE event pub/sub
│   ├── database.py          # Firestore client + CO₂ engine
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth_routes.py       # /sync, /me
│   │   ├── carbon_routes.py     # /submit, /tasks, /actions
│   │   ├── leaderboard_routes.py
│   │   └── logs_routes.py       # SSE stream
│   └── tests/
│       ├── test_database.py     # CO₂ calculation + name gen tests
│       ├── test_models.py       # Pydantic validation tests
│       └── test_logic.py        # Basic sanity tests
├── Dockerfile               # Multi-stage build (Node + Python)
└── README.md
```

---

## ♿ Accessibility

- **Skip Navigation**: Skip-to-content link for keyboard users
- **Semantic HTML**: Proper heading hierarchy, landmark roles
- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full tab-order support
- **Screen Reader Support**: Dynamic content announced via ARIA live regions
- **Color Contrast**: High-contrast neon-on-dark design meets WCAG AA
- **Focus Indicators**: Visible focus rings on all interactive elements

---

## 📄 License

MIT — Built for the PromptWars Hackathon Challenge.
