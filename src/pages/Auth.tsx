import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError) => {
    console.error("Auth error details:", error);
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes("Invalid login credentials")) {
            return "שם משתמש או סיסמה שגויים. אנא נסה שוב.";
          }
          if (error.message.includes("Email rate limit exceeded")) {
            return "נשלחו יותר מדי בקשות לאיפוס סיסמה. אנא נסה שוב מאוחר יותר.";
          }
          return "אירעה שגיאה בתהליך ההתחברות. אנא נסה שוב.";
        case 401:
          if (error.message.includes("Invalid API key")) {
            console.error("Invalid API key error. Please check Supabase configuration.");
            return "אירעה שגיאה בהתחברות למערכת. אנא פנה למנהל המערכת.";
          }
          return "אירעה שגיאה בהתחברות למערכת. אנא נסה שוב.";
        case 422:
          return "אנא וודא שהזנת את כל הפרטים הנדרשים.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  useEffect(() => {
    // Check for password reset parameters in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const access_token = hashParams.get("access_token");
    
    if (type === "recovery" && access_token) {
      // We're in a password reset flow
      console.log("Password reset flow detected");
      toast({
        title: "איפוס סיסמה",
        description: "אנא הזן את הסיסמה החדשה שלך",
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "איפוס סיסמה",
          description: "הזן את הסיסמה החדשה שלך",
        });
      } else if (event === "USER_UPDATED") {
        const { error } = await supabase.auth.getSession();
        if (error) {
          toast({
            title: "שגיאה",
            description: getErrorMessage(error),
            variant: "destructive",
          });
        } else {
          toast({
            title: "הצלחה",
            description: "הסיסמה עודכנה בהצלחה",
          });
          navigate("/");
        }
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
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: "אימייל",
                  password_label: "סיסמה",
                  button_label: "התחבר",
                  loading_button_label: "מתחבר...",
                  link_text: "כבר יש לך חשבון? התחבר",
                },
                sign_up: {
                  email_label: "אימייל",
                  password_label: "סיסמה",
                  button_label: "הרשם",
                  loading_button_label: "נרשם...",
                  link_text: "אין לך חשבון? הרשם",
                },
                forgotten_password: {
                  email_label: "אימייל",
                  button_label: "שלח הוראות איפוס סיסמה",
                  loading_button_label: "שולח הוראות...",
                  link_text: "שכחת סיסמה?",
                  confirmation_text: "בדוק את תיבת הדואר שלך להוראות איפוס הסיסמה",
                },
                update_password: {
                  password_label: "סיסמה חדשה",
                  button_label: "עדכן סיסמה",
                  loading_button_label: "מעדכן סיסמה...",
                  confirmation_text: "הסיסמה עודכנה בהצלחה",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;