import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { PlayerForm, PlayerFormData } from "@/components/PlayerForm";

const Player = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlayerFormSubmit = (data: PlayerFormData) => {
    console.log("Form submitted:", data);
    // Handle form submission logic here
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-right">הרשמה / התחברות</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                },
              },
            },
            style: {
              button: { width: '100%' },
              anchor: { color: '#2563eb' },
              container: { width: '100%' },
              message: { textAlign: 'right' },
              label: { textAlign: 'right' },
            },
          }}
          localization={{
            variables: {
              sign_up: {
                email_label: 'אימייל',
                password_label: 'סיסמה',
                button_label: 'הרשמה',
                link_text: 'אין לך חשבון? הירשם',
              },
              sign_in: {
                email_label: 'אימייל',
                password_label: 'סיסמה',
                button_label: 'התחברות',
                link_text: 'יש לך כבר חשבון? התחבר',
              },
            },
          }}
          theme="light"
          providers={[]}
        />
      </div>
    );
  }

  return <PlayerForm onSubmit={handlePlayerFormSubmit} />;
};

export default Player;