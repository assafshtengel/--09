import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Home, LayoutDashboard, LogOut, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "התנתקת בהצלחה",
      description: "תודה שבחרת בנו!",
    });
    navigate("/auth");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={() => navigate("/")}
        >
          <Home className="h-4 w-4" />
          דף הבית
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard className="h-4 w-4" />
          לוח בקרה
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={() => navigate("/pre-match-report")}
        >
          <FileText className="h-4 w-4" />
          הכנה למשחק
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={() => navigate("/game-summary")}
        >
          <Activity className="h-4 w-4" />
          סיכום משחק
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {userRole === 'admin' && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-100"
            onClick={() => navigate("/admin")}
          >
            ניהול
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          התנתק
        </Button>
      </div>
    </nav>
  );
};
