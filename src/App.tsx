import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Player from "./pages/Player";
import Admin from "./pages/Admin";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import PlayerPortfolio from "./pages/PlayerPortfolio";
import MentalLearning from "./pages/MentalLearning";
import NotificationsManager from "./pages/NotificationsManager";
import Achievements from "./pages/Achievements";
import { TrainingSummaryDashboard } from "./components/training/TrainingSummaryDashboard";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return <>{children}</>;
};

function App() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
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
              path="/player"
              element={
                <ProtectedRoute>
                  <Player />
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
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training-summary"
              element={
                <ProtectedRoute>
                  <TrainingSummaryDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;