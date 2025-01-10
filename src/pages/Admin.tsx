import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", session.user.id)
        .single();

      if (profile?.email !== "socr.co.il@gmail.com") {
        toast({
          title: "גישה נדחתה",
          description: "אין לך הרשאות לצפות בדף זה",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    };

    checkAdminStatus();
  }, [navigate, toast]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">דף ניהול</h1>
      <Card>
        <CardHeader>
          <CardTitle>ניהול מערכת</CardTitle>
        </CardHeader>
        <CardContent>
          <p>ברוך הבא לדף הניהול. כאן תוכל לנהל את המערכת ולצפות בנתונים.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;