import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerForm } from "@/components/PlayerForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        // If profile exists and we're on /profile, redirect to dashboard
        if (window.location.pathname === '/profile') {
          navigate('/dashboard');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async () => {
    toast({
      title: "פרופיל נשמר בהצלחה",
      description: "מועבר לדף הבית",
    });
    navigate('/dashboard');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-right">הפרופיל שלי</h1>
          <PlayerForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default Profile;