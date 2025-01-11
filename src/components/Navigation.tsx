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

    checkAdminStatus();
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

  const navigationItems = [
    { title: "בית", path: "/" },
    { title: "פרופיל", path: "/profile" },
    { title: "תיק שחקן", path: "/portfolio" },
    { title: "לוח בקרה", path: "/dashboard" },
    { title: "תכנון משחק", path: "/pre-game-planner" },
    { title: "מעקב משחק", path: "/match/new" },
    { title: "היסטוריית משחקים", path: "/game-history" },
    { title: "אימון מנטלי", path: "/mental-learning" },
    { title: "התראות", path: "/notifications" },
  ];

  return (
    <nav className="bg-white shadow-sm p-4 mb-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <Button variant="ghost" onClick={handleSignOut}>
          התנתק
        </Button>
        <div className="flex flex-wrap gap-2">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className="whitespace-nowrap"
            >
              {item.title}
            </Button>
          ))}
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