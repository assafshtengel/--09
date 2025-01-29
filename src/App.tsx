import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AdminRoute } from "@/components/AdminRoute";
import Auth from "./pages/Auth"; // Import directly instead of lazy loading

// Lazy load other components
const Index = lazy(() => import("./pages/Index"));
const Player = lazy(() => import("./pages/Player"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })));
const Admin = lazy(() => import("./pages/Admin"));
const MentalLearning = lazy(() => import("./pages/MentalLearning"));
const GameHistory = lazy(() => import("./pages/GameHistory"));
const PreMatchReport = lazy(() => import("@/components/pre-match/PreMatchReport").then(module => ({ default: module.PreMatchReport })));
const WeeklyScheduleWizard = lazy(() => import("@/components/schedule/WeeklyScheduleWizard").then(module => ({ default: module.WeeklyScheduleWizard })));
const DailyRoutineForm = lazy(() => import("@/components/daily-routine/DailyRoutineForm").then(module => ({ default: module.DailyRoutineForm })));
const GameSelection = lazy(() => import("@/components/game/GameSelection").then(module => ({ default: module.GameSelection })));
const GameTracker = lazy(() => import("@/components/GameTracker"));
const NotificationsManager = lazy(() => import("./pages/NotificationsManager"));
const PlayerPortfolio = lazy(() => import("./pages/PlayerPortfolio"));
const TrainingSummaryDashboard = lazy(() => import("@/components/training/TrainingSummaryDashboard").then(module => ({ default: module.TrainingSummaryDashboard })));
const PreGamePlanner = lazy(() => import("./pages/PreGamePlanner"));
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const HavayotCategories = lazy(() => import("./pages/HavayotCategories"));
const PreMatchReportsList = lazy(() => import("./pages/PreMatchReportsList"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">טוען...</p>
    </div>
  </div>
);

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <div className="w-full mx-auto bg-white">
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <Routes>
              <Route path="/auth" element={<Auth />} /> {/* Direct component usage */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminDashboard />
                      </Suspense>
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Admin />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/player"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Player />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Profile />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mental-learning"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <MentalLearning />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pre-match-report"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <PreMatchReport />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <WeeklyScheduleWizard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily-routine"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <DailyRoutineForm />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game-history"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <GameHistory />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game-selection"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <GameSelection />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <GameTracker />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <NotificationsManager />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <PlayerPortfolio />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training-summary"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TrainingSummaryDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pre-game-planner"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <PreGamePlanner />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/havayot-categories"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <HavayotCategories />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pre-match-reports-list"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <PreMatchReportsList />
                    </Suspense>
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
