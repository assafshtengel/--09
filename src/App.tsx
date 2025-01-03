import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AuthPage } from "@/pages/AuthPage";
import { HomePage } from "@/pages/HomePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AdminPage } from "@/pages/AdminPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GameTrackerPage } from "@/pages/GameTrackerPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Navigation />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
                <Route path="/game/:id" element={<GameTrackerPage />} />
              </Route>
            </Routes>
          </div>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;