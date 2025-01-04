import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { PreMatchReport } from "./pages/PreMatchReport";
import { GameTracker } from "./pages/GameTracker";
import { PreMatchSummary } from "./components/pre-match/PreMatchSummary";
import { Toaster } from "./components/ui/toaster";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
      if (event === 'SIGNED_OUT') {
        navigate('/signin');
      }
    });
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
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
          path="/pre-match-report"
          element={
            <ProtectedRoute>
              <PreMatchReport />
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
        <Route
          path="/pre-match-summary/:matchId"
          element={
            <ProtectedRoute>
              <PreMatchSummary />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;