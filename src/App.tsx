import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { Profile } from "@/pages/Profile";
import { Index } from "@/pages/Index";
import { Admin } from "@/pages/Admin";
import { GameHistory } from "@/pages/GameHistory";
import { PreGamePlanner } from "@/pages/PreGamePlanner";
import { WeeklyPlanner } from "@/pages/WeeklyPlanner";
import { PlayerPortfolio } from "@/pages/PlayerPortfolio";
import { MentalLearning } from "@/pages/MentalLearning";
import { NotificationsManager } from "@/pages/NotificationsManager";
import { GameTracker } from "@/components/GameTracker";
import { TrainingSummaryForm } from "@/components/training/TrainingSummaryForm";
import { GameSelection } from "@/components/game/GameSelection";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <Router>
      <Navigation />
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
        {/* Restored Routes */}
        <Route
          path="/game-selection"
          element={
            <ProtectedRoute>
              <GameSelection />
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
          path="/training-summary"
          element={
            <ProtectedRoute>
              <TrainingSummaryForm />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;