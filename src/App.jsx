/**
 * App.jsx — Root router for CarbonZero.
 * Provides AppContext + React Router + route definitions.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import TopBar from './components/TopBar'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import EcoActionsPage from './pages/EcoActionsPage'
import AboutPage      from './pages/AboutPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <TopBar />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eco-actions"
            element={
              <ProtectedRoute>
                <EcoActionsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
