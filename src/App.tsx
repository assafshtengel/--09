import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Player from "./pages/Player";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import MentalLearning from "./pages/MentalLearning";
import GameHistory from "./pages/GameHistory";
import { PreMatchReport } from "@/components/pre-match/PreMatchReport";
import { WeeklyScheduleWizard } from "@/components/schedule/WeeklyScheduleWizard";
import { DailyRoutineForm } from "@/components/daily-routine/DailyRoutineForm";
import { GameSelection } from "@/components/game/GameSelection";
import { GameTracker } from "@/components/GameTracker";
import NotificationsManager from "./pages/NotificationsManager";
import PlayerPortfolio from "./pages/PlayerPortfolio";
import { TrainingSummaryDashboard } from "@/components/training/TrainingSummaryDashboard";
import PreGamePlanner from "./pages/PreGamePlanner";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import HavayotCategories from "./pages/HavayotCategories";
import PreMatchReportsList from "./pages/PreMatchReportsList";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } };

    const checkAuth = async () => {
      try {
        console.log("[ProtectedRoute] Checking authentication...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[ProtectedRoute] Session error:", sessionError);
          throw sessionError;
        }

        if (!isMounted) return;

        setIsAuthenticated(!!session);
        setUserEmail(session?.user?.email || null);

        if (session?.user) {
          console.log("[ProtectedRoute] Fetching profile for user:", session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('roles')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("[ProtectedRoute] Profile fetch error:", profileError);
            throw profileError;
          }

          if (!isMounted) return;
          setHasProfile(!!profile?.roles?.length);
        }

        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error("[ProtectedRoute] Auth check error:", error);
        if (!isMounted) return;
        setError(error.message);
        setIsAuthenticated(false);
        setHasProfile(false);
        setIsLoading(false);
      }
    };

    const setupAuthListener = async () => {
      authSubscription = await supabase.auth.onAuthStateChange((event, session) => {
        console.log("[ProtectedRoute] Auth state changed:", event);
        if (!isMounted) return;
        
        setIsAuthenticated(!!session);
        setUserEmail(session?.user?.email || null);
        
        if (session?.user) {
          checkAuth();
        } else {
          setIsLoading(false);
        }
      });
    };

    setupAuthListener();
    checkAuth();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">שגיאה בטעינת הנתונים</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

const HomeRoute = () => {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('roles')
            .eq('id', session.user.id)
            .maybeSingle();

          setHasProfile(!!profile?.roles?.length);
        }
      } catch (error) {
        console.error("Profile check error:", error);
        setHasProfile(false);
      }
    };

    checkProfile();
  }, []);

  if (hasProfile === null) {
    return <div>טוען...</div>;
  }

  return hasProfile ? <Navigate to="/dashboard" replace /> : <Index />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUserEmail(session?.user?.email || null);
        setIsLoading(false);
      } catch (error) {
        console.error("Admin check error:", error);
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return <div>טוען...</div>;
  }

  if (userEmail !== "socr.co.il@gmail.com") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <div className="w-full mx-auto bg-white">
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomeRoute />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
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
                path="/mental-learning"
                element={
                  <ProtectedRoute>
                    <MentalLearning />
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
                path="/game-history"
                element={
                  <ProtectedRoute>
                    <GameHistory />
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
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsManager />
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
                path="/training-summary"
                element={
                  <ProtectedRoute>
                    <TrainingSummaryDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pre-game-planner"
                element={
                  <ProtectedRoute>
                    <PreGamePlanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/havayot-categories"
                element={
                  <ProtectedRoute>
                    <HavayotCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pre-match-reports-list"
                element={
                  <ProtectedRoute>
                    <PreMatchReportsList />
                  </ProtectedRoute>
                }
              />
              <Route path="/coach" element={<Navigate to="/" replace />} />
              <Route path="/analyst" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
