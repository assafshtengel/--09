import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/react-query";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import { Dashboard } from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Portfolio from "@/pages/Portfolio";
import PreMatchReport from "@/pages/PreMatchReport";
import Admin from "@/pages/Admin";
import Home from "@/pages/Home";
import { Navigation } from "@/components/Navigation";
import { useAuthState } from "@/hooks/use-auth-state";

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <div className="relative flex min-h-screen flex-col">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolio"
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <Portfolio />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pre-match-report"
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <PreMatchReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Navigation />
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster />
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuthState();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  return <>{children}</>;
};

export default App;