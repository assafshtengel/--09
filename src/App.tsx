import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Navigation } from "@/components/Navigation";
import { useAuthState } from "@/hooks/use-auth-state";
import { AdminRoute } from "@/components/AdminRoute";
import { LoadingScreen } from "@/components/LoadingScreen";

// Prioritize loading the Dashboard component with reduced minimum time
const Dashboard = lazy(() => 
  Promise.all([
    import("@/pages/Dashboard").then(module => ({ default: module.Dashboard })),
    new Promise(resolve => setTimeout(resolve, 300))
  ]).then(([module]) => module)
);

// Lazy load other components
const GameHistory = lazy(() => import("@/pages/GameHistory"));
const PreMatchReport = lazy(() => import("@/pages/PreMatchReport"));
const Match = lazy(() => import("@/pages/Match").then(module => ({ default: module.Match })));
const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Admin = lazy(() => import("@/pages/Admin"));
const PreGamePlanner = lazy(() => import("@/pages/PreGamePlanner"));
const Home = lazy(() => import("@/pages/Home"));
const Player = lazy(() => import("@/pages/Player"));
const Coach = lazy(() => import("@/pages/Coach"));
const Analyst = lazy(() => import("@/pages/Analyst"));
const MentalLearning = lazy(() => import("@/pages/MentalLearning"));
const NotificationsManager = lazy(() => import("@/pages/NotificationsManager"));
const HavayotCategories = lazy(() => import("@/pages/HavayotCategories"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const PreMatchReportsList = lazy(() => import("@/pages/PreMatchReportsList"));
const GameSummary = lazy(() => import("@/components/game/GameSummary").then(module => ({ default: module.GameSummary })));

function AppContent() {
  const { isLoading } = useAuthState();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game-history" element={<GameHistory />} />
            <Route path="/match/:id" element={<Match />} />
            <Route path="/pre-match-report" element={<PreMatchReport />} />
            <Route path="/pre-match-report/:id" element={<PreMatchReport />} />
            <Route path="/pre-match-reports" element={<PreMatchReportsList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/pre-game-planner" element={<PreGamePlanner />} />
            <Route path="/player" element={<Player />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/analyst" element={<Analyst />} />
            <Route path="/mental-learning" element={<MentalLearning />} />
            <Route path="/notifications" element={<NotificationsManager />} />
            <Route path="/havayot-categories" element={<HavayotCategories />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/game-summary/:id?" element={<GameSummary />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
          </Routes>
        </Suspense>
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
