import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotificationsManager from "@/pages/NotificationsManager";
import PreGamePlanner from "@/pages/PreGamePlanner";
import WeeklyPlanner from "@/pages/WeeklyPlanner";
import TrainingSummary from "@/pages/TrainingSummary";
import GameHistory from "@/pages/GameHistory";
import Portfolio from "@/pages/Portfolio";
import MentalLearning from "@/pages/MentalLearning";
import Admin from "@/pages/Admin";
import { GameTracker } from "@/components/GameTracker";
import { GameSelection } from "@/components/game/GameSelection";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsManager /></ProtectedRoute>} />
        <Route path="/pre-game-planner" element={<ProtectedRoute><PreGamePlanner /></ProtectedRoute>} />
        <Route path="/weekly-planner" element={<ProtectedRoute><WeeklyPlanner /></ProtectedRoute>} />
        <Route path="/training-summary" element={<ProtectedRoute><TrainingSummary /></ProtectedRoute>} />
        <Route path="/game-history" element={<ProtectedRoute><GameHistory /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/mental-learning" element={<ProtectedRoute><MentalLearning /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/game-selection" element={<ProtectedRoute><GameSelection /></ProtectedRoute>} />
        <Route path="/game/:id" element={<ProtectedRoute><GameTracker /></ProtectedRoute>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;