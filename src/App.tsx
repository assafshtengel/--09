import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import GameHistory from "@/pages/GameHistory";
import PlayerPortfolio from "@/pages/PlayerPortfolio";
import NotificationsManager from "@/pages/NotificationsManager";
import MentalLearning from "@/pages/MentalLearning";
import Player from "@/pages/Player";
import PreGamePlannerPage from "@/pages/PreGamePlanner";
import { TrainingSummaryDashboard } from "@/components/training/TrainingSummaryDashboard";
import { GameSelection } from "@/components/game/GameSelection";
import { PreMatchReport } from "@/components/pre-match/PreMatchReport";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <div className="relative flex min-h-screen flex-col">
            <Router>
              <Navigation />
              <div className="flex-1">
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
                      <ProtectedRoute adminOnly>
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
                    path="/portfolio"
                    element={
                      <ProtectedRoute>
                        <PlayerPortfolio />
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
                    path="/player"
                    element={
                      <ProtectedRoute>
                        <Player />
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
                    path="/training-summary"
                    element={
                      <ProtectedRoute>
                        <TrainingSummaryDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/game-selection"
                    element={
                      <ProtectedRoute>
                        <GameSelection />
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
              </div>
            </Router>
          </div>
        </div>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;