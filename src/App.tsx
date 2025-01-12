import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import PreGamePlannerPage from "@/pages/PreGamePlanner";
import WeeklyPlanner from "@/pages/WeeklyPlanner";
import MatchPage from "@/pages/Match";
import MatchesPage from "@/pages/Matches";
import ProfilePage from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";
import NotFoundPage from "@/pages/404";
import GameSelectionPage from "@/pages/GameSelection";
import TrainingSummaryPage from "@/pages/TrainingSummary";
import GameHistoryPage from "@/pages/GameHistory";
import PortfolioPage from "@/pages/Portfolio";
import MentalLearningPage from "@/pages/MentalLearning";
import NotificationsManagerPage from "@/pages/NotificationsManager";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" expand={true} richColors />
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
          path="/game-selection"
          element={
            <ProtectedRoute>
              <GameSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-summary"
          element={
            <ProtectedRoute>
              <TrainingSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game-history"
          element={
            <ProtectedRoute>
              <GameHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mental-learning"
          element={
            <ProtectedRoute>
              <MentalLearningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pre-game-planner"
          element={
            <ProtectedRoute>
              <PreGamePlannerPage />
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
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches/:id"
          element={
            <ProtectedRoute>
              <MatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;