import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PreMatchReport } from "@/pages/PreMatchReport";
import { PreMatchSummary } from "@/components/pre-match/PreMatchSummary";
import Dashboard from "@/pages/Dashboard";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import "./App.css";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route
          path="/"
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
          path="/pre-match-summary/:reportId"
          element={
            <ProtectedRoute>
              <PreMatchSummary />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;