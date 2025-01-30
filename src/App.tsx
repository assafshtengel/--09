import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Navigation } from "@/components/Navigation";
import { useAuthState } from "@/hooks/use-auth-state";
import { AdminRoute } from "@/components/AdminRoute";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Prioritize loading the Dashboard component
const Dashboard = lazy(() => 
  Promise.all([
    import("@/pages/Dashboard").then(module => ({ default: module.Dashboard })),
    // Reduced minimum loading time to improve perceived performance
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

// Lazy load other components with lower priority
const GameHistory = lazy(() => import("@/pages/GameHistory"));
const PreMatchReport = lazy(() => import("@/pages/PreMatchReport"));
const Match = lazy(() => import("@/pages/Match").then(module => ({ default: module.Match })));
const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Admin = lazy(() => import("@/pages/Admin"));
const PreGamePlanner = lazy(() => import("@/pages/PreGamePlanner"));

// Enhanced loading fallback with better visual feedback
const LoadingFallback = () => (
  <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-4">
    <LoadingSpinner />
    <p className="text-muted-foreground animate-pulse">טוען...</p>
  </div>
);

function AppContent() {
  const { isLoading } = useAuthState();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4">
        <Suspense fallback={<LoadingFallback />}>
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