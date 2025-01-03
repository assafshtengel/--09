import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Import all pages
import Index from "@/pages/Index";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import { Match } from "@/pages/Match";
import { Training } from "@/pages/Training";
import { TrainingHistory } from "@/pages/TrainingHistory";
import { MatchHistory } from "@/pages/MatchHistory";
import { WeeklySchedule } from "@/pages/WeeklySchedule";
import Player from "@/pages/Player";
import PlayerPortfolio from "@/pages/PlayerPortfolio";
import { Settings } from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import { PreMatchReport } from "@/pages/PreMatchReport";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match"
            element={
              <ProtectedRoute>
                <Match />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <Training />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-history"
            element={
              <ProtectedRoute>
                <TrainingHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match-history"
            element={
              <ProtectedRoute>
                <MatchHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-schedule"
            element={
              <ProtectedRoute>
                <WeeklySchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player"
            element={
              <ProtectedRoute>
                <Player />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PlayerPortfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pre-match-report"
            element={
              <ProtectedRoute>
                <PreMatchReport />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;