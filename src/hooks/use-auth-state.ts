import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[AuthState] Checking authentication status...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[AuthState] Session error:", sessionError);
          if (sessionError.message?.includes('JWT expired')) {
            console.log("[AuthState] Token expired, attempting refresh...");
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session) {
              console.error("[AuthState] Refresh failed:", refreshError);
              throw new Error('Session refresh failed');
            }
            
            console.log("[AuthState] Session refreshed successfully");
            return;
          }
          throw sessionError;
        }

        if (!session) {
          console.log("[AuthState] No active session");
          navigate("/auth");
          return;
        }

        console.log("[AuthState] Valid session found");
      } catch (error: any) {
        console.error("[AuthState] Authentication error:", error);
        
        if (retryCount < 3) {
          console.log(`[AuthState] Retrying... (${retryCount + 1}/3)`);
          setRetryCount(prev => prev + 1);
          setTimeout(checkAuth, 1000 * (retryCount + 1));
        } else {
          toast({
            title: "שגיאת התחברות",
            description: "אנא התחבר מחדש",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthState] Auth state changed:", event);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("[AuthState] Token refreshed automatically");
      } else if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    checkAuth();
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, retryCount, toast]);

  return { isLoading };
};