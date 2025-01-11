import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Player from "@/pages/Player";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import GameHistory from "@/pages/GameHistory";
import PreGamePlanner from "@/pages/PreGamePlanner";
import WeeklyPlanner from "@/pages/WeeklyPlanner";
import NotificationsManager from "@/pages/NotificationsManager";
import MentalLearning from "@/pages/MentalLearning";
import PlayerPortfolio from "@/pages/PlayerPortfolio";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/player" element={<Player />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game-history"
          element={
            <ProtectedRoute>
              <GameHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pre-game-planner"
          element={
            <ProtectedRoute>
              <PreGamePlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly-planner"
          element={
            <ProtectedRoute>
              <WeeklyPlanner />
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
          path="/mental-learning"
          element={
            <ProtectedRoute>
              <MentalLearning />
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
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;