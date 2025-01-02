import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Game from "@/pages/Game";
import Index from "@/pages/Index";
import Player from "@/pages/Player";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import PreMatchReport from "@/pages/PreMatchReport";
import { GameSelection } from "@/components/game/GameSelection";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div dir="rtl">
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/player" element={<Player />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pre-match-report" element={<PreMatchReport />} />
              <Route path="/game" element={<GameSelection />} />
              <Route path="/game/:id" element={<Game />} />
            </Routes>
          </Router>
          <Toaster />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;