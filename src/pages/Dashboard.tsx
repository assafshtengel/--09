import { Suspense, lazy, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AnimatePresence } from "framer-motion";

// Import new section components
import { AdminSection } from "@/components/dashboard/sections/AdminSection";
import { WelcomeSection } from "@/components/dashboard/sections/WelcomeSection";
import { ChatOptions } from "@/components/dashboard/sections/ChatOptions";
import { QuickActions } from "@/components/dashboard/sections/QuickActions";
import { StatsSection } from "@/components/dashboard/sections/StatsSection";

// Lazy load components that are not immediately visible
const MotivationalPopup = lazy(() => 
  Promise.all([
    import("@/components/dashboard/MotivationalPopup").then(module => ({ default: module.MotivationalPopup })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const GoalsSection = lazy(() => 
  Promise.all([
    import("@/components/dashboard/GoalsSection").then(module => ({ default: module.GoalsSection })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const Dashboard = () => {
  const [isMotivationalPopupOpen, setIsMotivationalPopupOpen] = useState(true);
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return null;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const isAdmin = profile?.email === "socr.co.il@gmail.com";

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-4 space-y-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <MotivationalPopup 
            isOpen={isMotivationalPopupOpen} 
            onClose={() => setIsMotivationalPopupOpen(false)} 
          />
        </Suspense>
      
        {isAdmin && <AdminSection />}
        <WelcomeSection fullName={profile?.full_name} />
        <ChatOptions />
        <QuickActions />

        <Suspense fallback={<LoadingScreen />}>
          <GoalsSection />
        </Suspense>

        <StatsSection />
      </AnimatePresence>
    </div>
  );
};

export { Dashboard };