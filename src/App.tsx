import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PreMatchReport } from "@/components/pre-match/PreMatchReport";
import { PostMatchReport } from "@/components/post-match/PostMatchReport";
import { MatchHistory } from "@/components/game/history/MatchHistory";
import { MatchDetails } from "@/components/game/history/MatchDetails";
import { HavayotIntroPage } from "@/components/pre-match/HavayotIntroPage";
import { Sonner } from "sonner";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pre-match-intro" element={<HavayotIntroPage />} />
        <Route path="/pre-match-report" element={<PreMatchReport />} />
        <Route path="/post-match-report/:matchId" element={<PostMatchReport />} />
        <Route path="/match-history" element={<MatchHistory />} />
        <Route path="/match/:matchId" element={<MatchDetails />} />
      </Routes>
      <Toaster />
      <Sonner />
    </Router>
  );
};

export default App;