import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import PlayerPortfolio from "@/pages/PlayerPortfolio";
import MentalLearning from "@/pages/MentalLearning";
import NotificationsManager from "@/pages/NotificationsManager";
import PreGamePlanner from "@/pages/PreGamePlanner";
import GameHistory from "@/pages/GameHistory";
import { GameTracker } from "@/components/GameTracker";
import ProtectedRoute from "@/components/ProtectedRoute";
import Player from "@/pages/Player";

function App() {
  return (
    <Router>
      <div dir="rtl">
        <Navigation />
        <main>
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
              path="/pre-game-planner"
              element={
                <ProtectedRoute>
                  <PreGamePlanner />
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
              path="/match/:id"
              element={
                <ProtectedRoute>
                  <GameTracker />
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
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;