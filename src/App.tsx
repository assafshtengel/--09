import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Player from "./pages/Player";
import Dashboard from "./pages/Dashboard";
import { PreMatchReport } from "@/components/pre-match/PreMatchReport";
import { WeeklyScheduleWizard } from "@/components/schedule/WeeklyScheduleWizard";
import { DailyRoutineForm } from "@/components/daily-routine/DailyRoutineForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div dir="rtl">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/player" element={<Player />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pre-match-report" element={<PreMatchReport />} />
            <Route path="/schedule" element={<WeeklyScheduleWizard />} />
            <Route path="/daily-routine" element={<DailyRoutineForm />} />
            <Route path="/coach" element={<Navigate to="/" replace />} />
            <Route path="/analyst" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;