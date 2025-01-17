import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import PreGamePlannerNew from "./pages/PreGamePlannerNew";
import PreGamePlanner from "./pages/PreGamePlanner";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-heebo">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
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