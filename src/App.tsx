import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import GameTracker from "@/components/GameTracker";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Auth = lazy(() => import("@/pages/Auth"));
const GameHistory = lazy(() => import("@/pages/GameHistory"));
const PreMatchReport = lazy(() => import("@/pages/PreMatchReport"));
const GameSummary = lazy(() => import("@/pages/GameSummary"));
const Profile = lazy(() => import("@/pages/Profile"));
const Match = lazy(() => import("@/pages/Match"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
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
                  path="/pre-match-report/:id"
                  element={
                    <ProtectedRoute>
                      <PreMatchReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/game-summary/:id"
                  element={
                    <ProtectedRoute>
                      <GameSummary />
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
                  path="/match/:id"
                  element={
                    <ProtectedRoute>
                      <Match />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/game/:id"
                  element={
                    <ProtectedRoute>
                      <GameTracker />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;