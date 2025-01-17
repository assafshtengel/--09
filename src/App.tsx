import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import PreGamePlannerNew from "./pages/PreGamePlannerNew";
import PreGamePlanner from "./pages/PreGamePlanner";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GameHistory from "./pages/GameHistory";
import HavayotCategories from "./pages/HavayotCategories";
import MentalLearning from "./pages/MentalLearning";
import NotificationsManager from "./pages/NotificationsManager";
import Player from "./pages/Player";
import PlayerPortfolio from "./pages/PlayerPortfolio";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-heebo">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game-history" element={<GameHistory />} />
            <Route path="/havayot-categories" element={<HavayotCategories />} />
            <Route path="/mental-learning" element={<MentalLearning />} />
            <Route path="/notifications" element={<NotificationsManager />} />
            <Route path="/player" element={<Player />} />
            <Route path="/portfolio" element={<PlayerPortfolio />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pre-game-planner" element={<PreGamePlanner />} />
            <Route path="/pre-game-planner_NEW" element={<PreGamePlannerNew />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;