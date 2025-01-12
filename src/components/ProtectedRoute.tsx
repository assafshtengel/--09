import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          toast({
            title: "נדרשת התחברות",
            description: "אנא התחבר כדי לגשת לדף זה",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        if (adminOnly) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;

          if (profile?.role !== "admin") {
            toast({
              title: "גישה נדחתה",
              description: "אין לך הרשאות לצפות בדף זה",
              variant: "destructive",
            });
            navigate("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בבדיקת ההרשאות",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, adminOnly, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  return <>{children}</>;
};