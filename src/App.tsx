import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Navigation } from "@/components/Navigation";
import { useAuthState } from "@/hooks/use-auth-state";
import GameHistory from "@/pages/GameHistory";
import { AdminRoute } from "@/components/AdminRoute";
import PreMatchReport from "@/pages/PreMatchReport";
import { Match } from "@/pages/Match";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Portfolio from "@/pages/Portfolio";
import Admin from "@/pages/Admin";
import PreGamePlanner from "@/pages/PreGamePlanner";

function AppContent() {
  const { isLoading } = useAuthState();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-history" element={<GameHistory />} />
          <Route path="/match/:id" element={<Match />} />
          <Route path="/pre-match-report" element={<PreMatchReport />} />
          <Route path="/pre-match-report/:id" element={<PreMatchReport />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/pre-game-planner" element={<PreGamePlanner />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;