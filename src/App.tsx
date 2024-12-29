import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Player from "./pages/Player";
import Dashboard from "./pages/Dashboard";
import { PreMatchReport } from "@/components/pre-match/PreMatchReport";
import { WeeklyScheduleWizard } from "@/components/schedule/WeeklyScheduleWizard";
import { DailyRoutineForm } from "@/components/daily-routine/DailyRoutineForm";
import { GameSelection } from "@/components/game/GameSelection";
import { GameTracker } from "@/components/GameTracker";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>טוען...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto min-h-screen bg-white">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
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
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute>
                    <WeeklyScheduleWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily-routine"
                element={
                  <ProtectedRoute>
                    <DailyRoutineForm />
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
                path="/match/:id"
                element={
                  <ProtectedRoute>
                    <GameTracker />
                  </ProtectedRoute>
                }
              />
              <Route path="/coach" element={<Navigate to="/" replace />} />
              <Route path="/analyst" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;