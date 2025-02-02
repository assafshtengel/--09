import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Dashboard from "@/pages/Dashboard";
import PreMatchReport from "@/pages/PreMatchReport";
import GameSummary from "@/pages/GameSummary";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import { GameTracker } from "@/components/GameTracker";
import PlayerPortfolio from "@/pages/PlayerPortfolio";
import MentalLearning from "@/pages/MentalLearning";
import NotificationsManager from "@/pages/NotificationsManager";
import Profile from "@/pages/Profile";
import ResetPassword from "@/pages/ResetPassword";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
          <Route
            path="/game-summary"
            element={
              <ProtectedRoute>
                <GameSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:id"
            element={
              <ProtectedRoute>
                <GameTracker />
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
            path="/mental-learning"
            element={
              <ProtectedRoute>
                <MentalLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsManager />
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;