import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  ClipboardList,
  Settings,
  LogOut,
  Activity,
  Trophy,
  Calendar,
  Bell,
  User,
} from "lucide-react";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להתנתק כרגע, נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pre-match-report">
              <Button variant="ghost" size="icon">
                <ClipboardList className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/game-summary">
              <Button variant="ghost" size="icon">
                <Trophy className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/schedule">
              <Button variant="ghost" size="icon">
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};