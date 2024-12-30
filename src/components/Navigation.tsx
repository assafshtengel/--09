import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    };

    const checkFirstVisit = async () => {
      const visited = localStorage.getItem('hasVisitedBefore');
      if (!visited) {
        setIsFirstVisit(true);
        localStorage.setItem('hasVisitedBefore', 'true');
        toast({
          title: "ברוכים הבאים!",
          description: "לחץ על הכפתורים בתפריט כדי לראות טיפים והסברים",
        });
      }
    };

    checkAdminStatus();
    checkFirstVisit();
  }, [toast]);

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
    { path: "/", label: "בית", tooltip: "חזרה לדף הבית" },
    { path: "/profile", label: "פרופיל", tooltip: "ניהול פרטי המשתמש" },
    { path: "/portfolio", label: "תיק שחקן", tooltip: "צפייה בהישגים וסטטיסטיקות" },
    { path: "/dashboard", label: "לוח בקרה", tooltip: "סקירת ביצועים ונתונים" },
  ];

  if (isAdmin) {
    navigationItems.push({ path: "/admin", label: "ניהול", tooltip: "ניהול המערכת" });
  }

  return (
    <TooltipProvider>
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={handleSignOut}>
                התנתק
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>יציאה מהמערכת</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex gap-4">
            {navigationItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      location.pathname === item.path && "bg-primary/10 text-primary"
                    )}
                  >
                    {item.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
};