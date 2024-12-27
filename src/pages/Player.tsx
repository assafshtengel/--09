import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { PlayerForm, PlayerFormData } from "@/components/PlayerForm";
import { PreMatchDashboard } from "@/components/pre-match/PreMatchDashboard";
import { TrainingSummaryDashboard } from "@/components/training/TrainingSummaryDashboard";
import { DailyRoutineForm } from "@/components/daily-routine/DailyRoutineForm";
import { WeeklyScheduleWizard } from "@/components/schedule/WeeklyScheduleWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Player = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [showPreMatch, setShowPreMatch] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlayerFormSubmit = (data: PlayerFormData) => {
    console.log("Form submitted:", data);
    setShowPreMatch(true);
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

  if (!showPreMatch) {
    return <PlayerForm onSubmit={handlePlayerFormSubmit} />;
  }

return (
    <Tabs defaultValue="dashboard" dir="rtl">
      <TabsList className="w-full justify-end mb-6">
        <TabsTrigger value="dashboard">דשבורד</TabsTrigger>
        <TabsTrigger value="training">סיכום אימון</TabsTrigger>
        <TabsTrigger value="daily-routine">תזונה ושינה</TabsTrigger>
        <TabsTrigger value="schedule">מערכת שבועית</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <PreMatchDashboard />
      </TabsContent>

      <TabsContent value="training">
        <TrainingSummaryDashboard />
      </TabsContent>

      <TabsContent value="daily-routine">
        <DailyRoutineForm />
      </TabsContent>

      <TabsContent value="schedule">
        <WeeklyScheduleWizard />
      </TabsContent>
    </Tabs>
  );
};

export default Player;
