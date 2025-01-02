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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        try {
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (!profile) {
            // If no profile exists, create a basic one and redirect to profile completion
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) throw insertError;

            navigate("/profile");
            toast({
              title: "ברוך הבא!",
              description: "אנא מלא את פרטי הפרופיל שלך",
            });
          } else {
            // If profile exists, redirect to dashboard
            navigate("/dashboard");
            toast({
              title: "ברוך הבא בחזרה!",
              description: "התחברת בהצלחה",
            });
          }
        } catch (error) {
          console.error('Error in auth flow:', error);
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בתהליך ההרשמה",
            variant: "destructive",
          });
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
                message: 'text-right',
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