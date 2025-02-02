import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeSection } from "@/components/dashboard/sections/WelcomeSection";
import { QuickActions } from "@/components/dashboard/sections/QuickActions";
import { StatsSection } from "@/components/dashboard/sections/StatsSection";
import { AdminSection } from "@/components/dashboard/sections/AdminSection";
import { ChatOptions } from "@/components/dashboard/sections/ChatOptions";
import { MotivationalPopup } from "@/components/dashboard/MotivationalPopup";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; role?: string } | null>(null);
  const [isMotivationalPopupOpen, setIsMotivationalPopupOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setUserProfile(profile);
        setIsAdmin(profile?.role === "admin");
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("שגיאה בטעינת הפרופיל");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  // Show motivational popup when component mounts
  useEffect(() => {
    if (!isLoading) {
      setIsMotivationalPopupOpen(true);
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <WelcomeSection fullName={userProfile?.full_name} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <QuickActions />
          {isAdmin && <AdminSection />}
        </div>
        
        <div className="space-y-8">
          <StatsSection />
          <ChatOptions />
        </div>
      </div>

      <MotivationalPopup 
        isOpen={isMotivationalPopupOpen} 
        onClose={() => setIsMotivationalPopupOpen(false)} 
      />
    </div>
  );
}