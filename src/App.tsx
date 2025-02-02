import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Lazy load components with proper chunk names
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Match = lazy(() => import("@/pages/Match"));
const Auth = lazy(() => import("@/pages/Auth"));
const GameHistory = lazy(() => import("@/pages/GameHistory"));
const PreMatchReport = lazy(() => import("@/pages/PreMatchReport"));
const Training = lazy(() => import("@/pages/Training"));
const GameSummary = lazy(() => import("@/pages/GameSummary"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export const AppContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/match/:id" element={<Match />} />
            <Route path="/game-history" element={<GameHistory />} />
            <Route path="/pre-match-report/:id" element={<PreMatchReport />} />
            <Route path="/training" element={<Training />} />
            <Route path="/game-summary/:id" element={<GameSummary />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;