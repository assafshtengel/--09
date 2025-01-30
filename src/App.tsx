import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Navigation } from "@/components/Navigation";
import { useAuthState } from "@/hooks/use-auth-state";
import GameHistory from "@/pages/GameHistory";

function App() {
  const { isLoading } = useAuthState();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <Routes>
              <Route path="/game-history" element={<GameHistory />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
