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
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log(`[Navigation] Starting admin status check (attempt ${retryAttempt + 1})`);
        
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Navigation] Session error:", sessionError);
          if (sessionError.message?.includes('JWT expired') || 
              sessionError.message?.includes('refresh_token_not_found') ||
              sessionError.message?.includes('invalid token')) {
            console.log("[Navigation] Invalid or expired token detected, cleaning up...");
            localStorage.removeItem('supabase.auth.token');
            await supabase.auth.signOut();
            navigate("/auth");
            return;
          }
          throw sessionError;
        }

        if (!session) {
          console.log("[Navigation] No active session found");
          setIsLoading(false);
          navigate("/auth");
          return;
        }

        console.log("[Navigation] Valid session found, checking profile...");
        
        // Add a small delay before making the profile request
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("[Navigation] Profile fetch error:", profileError);
          // Check for specific error types
          if (profileError.message?.includes('JWT expired')) {
            console.log("[Navigation] JWT expired during profile check");
            await handleSignOut();
            return;
          }
          if (profileError.code === '429') {
            console.log("[Navigation] Rate limit hit, will retry...");
            throw new Error('rate_limit');
          }
          if (profileError.code === '403') {
            console.log("[Navigation] Authorization error, will retry...");
            throw new Error('auth_error');
          }
          throw profileError;
        }

        console.log("[Navigation] Profile check complete, role:", profile?.role);
        setIsAdmin(profile?.role === "admin");
        setIsLoading(false);
        setRetryAttempt(0); // Reset retry counter on success
      } catch (error: any) {
        console.error("[Navigation] Error in checkAdminStatus:", error);
        
        if (retryAttempt < 3) {
          console.log(`[Navigation] Will retry in ${(retryAttempt + 1) * 1000}ms...`);
          setTimeout(() => {
            setRetryAttempt(prev => prev + 1);
          }, (retryAttempt + 1) * 1000);
        } else {
          console.error("[Navigation] Max retries reached");
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בטעינת הפרופיל. אנא נסה להתחבר מחדש.",
            variant: "destructive",
          });
          setIsLoading(false);
          navigate("/auth");
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Navigation] Auth state changed:", event);
      
      if (event === 'SIGNED_IN') {
        console.log("[Navigation] User signed in, checking admin status");
        setRetryAttempt(0);
        await checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        console.log("[Navigation] User signed out, resetting state");
        setIsAdmin(false);
        setIsLoading(false);
        navigate("/auth");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("[Navigation] Token refreshed, rechecking admin status");
        setRetryAttempt(0);
        await checkAdminStatus();
      }
    });

    // Initial check
    checkAdminStatus();

    return () => {
      console.log("[Navigation] Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, toast, retryAttempt]);

  const handleSignOut = async () => {
    try {
      console.log("[Navigation] Signing out...");
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      console.log("[Navigation] Sign out successful");
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
      navigate("/auth");
    } catch (error) {
      console.error("[Navigation] Error signing out:", error);
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