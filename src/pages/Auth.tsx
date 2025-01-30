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
    console.error("[Auth] Error details:", error);
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes("Email not confirmed")) {
            return "המייל טרם אומת. אנא בדוק את תיבת הדואר שלך לקבלת הוראות אימות.";
          }
          if (error.message.includes("Invalid login credentials")) {
            return "שם משתמש או סיסמה שגויים. אנא נסה שוב.";
          }
          if (error.message.includes("User not found")) {
            return "לא נמצא משתמש עם כתובת המייל הזו. אנא הירשם תחילה.";
          }
          if (error.message.includes("Email rate limit exceeded")) {
            return "נשלחו יותר מדי בקשות לאיפוס סיסמה. אנא נסה שוב מאוחר יותר.";
          }
          if (error.message.includes("refresh_token_not_found")) {
            supabase.auth.signOut();
            return "פג תוקף החיבור, אנא התחבר מחדש.";
          }
          return "אירעה שגיאה בתהליך ההתחברות. אנא נסה שוב.";
        case 401:
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
    console.log("[Auth] Component mounted");
    
    const checkSession = async () => {
      console.log("[Auth] Checking session...");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[Auth] Session check error:", error);
          toast({
            title: "שגיאת התחברות",
            description: getErrorMessage(error),
            variant: "destructive",
          });
          if (error.message.includes("refresh_token_not_found")) {
            await supabase.auth.signOut();
          }
          return;
        }

        if (session) {
          console.log("[Auth] Valid session found, redirecting to dashboard");
          navigate("/");
        } else {
          console.log("[Auth] No active session");
        }
      } catch (error) {
        console.error("[Auth] Unexpected error during session check:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בבדיקת החיבור. אנא נסה שוב.",
          variant: "destructive",
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] Auth state changed:", event, session?.user?.id);
      
      if (event === "SIGNED_IN" && session) {
        console.log("[Auth] User signed in, redirecting to dashboard");
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        console.log("[Auth] User signed out, clearing session data");
        localStorage.removeItem('supabase.auth.token');
      } else if (event === "PASSWORD_RECOVERY") {
        console.log("[Auth] Password recovery initiated");
        const token = session?.access_token;
        if (token) {
          try {
            // Create a password reset request record
            const { error: insertError } = await supabase
              .from("password_reset_requests")
              .insert([{ user_id: session.user.id }]);

            if (insertError) {
              console.error("[Auth] Error creating reset request:", insertError);
              throw insertError;
            }

            navigate("/auth/reset-password");
          } catch (error) {
            console.error("[Auth] Error in password recovery:", error);
            toast({
              title: "שגיאה",
              description: "אירעה שגיאה בתהליך איפוס הסיסמה",
              variant: "destructive",
            });
          }
        }
      }
    });

    checkSession();

    return () => {
      console.log("[Auth] Cleaning up auth subscription");
      subscription.unsubscribe();
    };
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