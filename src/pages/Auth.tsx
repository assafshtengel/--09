import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for password reset error
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");
    
    if (error) {
      toast({
        title: "שגיאה",
        description: errorDescription || "אירעה שגיאה בתהליך איפוס הסיסמה",
        variant: "destructive",
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "איפוס סיסמה",
          description: "הזן את הסיסמה החדשה שלך",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ברוך הבא</CardTitle>
        </CardHeader>
        <CardContent>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
              className: {
                container: 'flex flex-col gap-4',
                label: 'text-right block mb-2',
                button: 'w-full',
                input: 'text-right',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: "אימייל",
                  password_label: "סיסמה",
                  button_label: "התחבר",
                  loading_button_label: "מתחבר...",
                  social_provider_text: "התחבר באמצעות {{provider}}",
                  link_text: "כבר יש לך חשבון? התחבר",
                },
                sign_up: {
                  email_label: "אימייל",
                  password_label: "סיסמה",
                  button_label: "הרשם",
                  loading_button_label: "נרשם...",
                  social_provider_text: "הרשם באמצעות {{provider}}",
                  link_text: "אין לך חשבון? הרשם",
                },
                forgotten_password: {
                  email_label: "אימייל",
                  password_label: "סיסמה",
                  button_label: "שלח הוראות איפוס סיסמה",
                  loading_button_label: "שולח הוראות...",
                  link_text: "שכחת סיסמה?",
                },
              },
            }}
            providers={[]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;