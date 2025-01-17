import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // First check if we have an authenticated session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (!session) {
          console.log("No active session found");
          navigate("/auth");
          return;
        }

        console.log("Checking admin status for user:", session.user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        console.log("Profile data:", profile);
        setIsAdmin(profile?.role === "admin");
      } catch (error) {
        console.error("Error in checkAdminStatus:", error);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
    });

    // Initial check
    checkAdminStatus();

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהתנתקות",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm p-4 mb-6">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Button variant="ghost" onClick={handleSignOut}>
          התנתק
        </Button>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            בית
          </Button>
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            פרופיל
          </Button>
          <Button variant="ghost" onClick={() => navigate("/portfolio")}>
            תיק שחקן
          </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            לוח בקרה
          </Button>
          {isAdmin && (
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              ניהול
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};