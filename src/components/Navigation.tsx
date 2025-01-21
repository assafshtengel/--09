import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log("Starting admin status check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error in checkAdminStatus:", sessionError);
          const message = sessionError?.message || "";
          if (message.includes("refresh_token_not_found") || message.includes("JWT expired")) {
            console.log("Token error detected, cleaning up session");
            localStorage.removeItem('supabase.auth.token');
            await handleSignOut();
          }
          return;
        }

        if (!session) {
          console.log("No active session found, redirecting to auth");
          setIsLoading(false);
          navigate("/auth");
          return;
        }

        console.log("Valid session found, checking profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          if (profileError.message?.includes('JWT expired')) {
            console.log("JWT expired during profile check, signing out");
            await handleSignOut();
            return;
          }
          throw profileError;
        }

        console.log("Profile check complete, role:", profile?.role);
        setIsAdmin(profile?.role === "admin");
        setIsLoading(false);
      } catch (error: any) {
        console.error("Unexpected error in checkAdminStatus:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הפרופיל",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    const retryCheckAdminStatus = async () => {
      try {
        console.log(`Attempt ${retryCount + 1} to check admin status`);
        await checkAdminStatus();
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(retryCheckAdminStatus, retryDelay);
        } else {
          console.error("Max retries reached, redirecting to auth");
          navigate("/auth");
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in, checking admin status");
        await checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, resetting state");
        setIsAdmin(false);
        setIsLoading(false);
        navigate("/auth");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed, rechecking admin status");
        await checkAdminStatus();
      }
    });

    console.log("Initial admin status check starting...");
    retryCheckAdminStatus();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('supabase.auth.token');
      console.log("Sign out successful");
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      localStorage.removeItem('supabase.auth.token');
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהתנתקות",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-16">טוען...</div>;
  }

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