import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkToken = async () => {
      console.log("[ResetPassword] Checking token validity...");
      const token = searchParams.get("token");
      
      if (!token) {
        console.error("[ResetPassword] No token found in URL");
        toast({
          title: "שגיאה",
          description: "קישור לא תקין. אנא נסה שוב או צור קישור חדש.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("password_reset_requests")
          .select("*")
          .eq("token", token)
          .single();

        if (error) {
          console.error("[ResetPassword] Error checking token:", error);
          throw error;
        }

        if (!data || data.used || new Date(data.expires_at) < new Date()) {
          console.error("[ResetPassword] Token invalid or expired");
          toast({
            title: "שגיאה",
            description: "הקישור פג תוקף או כבר נוצל. אנא צור קישור חדש.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } catch (error) {
        console.error("[ResetPassword] Error:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בבדיקת תוקף הקישור",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkToken();
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ResetPassword] Starting password reset process...");

    if (newPassword !== confirmPassword) {
      toast({
        title: "שגיאה",
        description: "הסיסמאות אינן תואמות",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = searchParams.get("token");
      console.log("[ResetPassword] Updating password with token");

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("[ResetPassword] Error updating password:", updateError);
        throw updateError;
      }

      // Mark the reset request as used
      const { error: tokenUpdateError } = await supabase
        .from("password_reset_requests")
        .update({ used: true })
        .eq("token", token);

      if (tokenUpdateError) {
        console.error("[ResetPassword] Error marking token as used:", tokenUpdateError);
      }

      console.log("[ResetPassword] Password updated successfully");
      toast({
        title: "הצלחה",
        description: "הסיסמה עודכנה בהצלחה",
      });
      
      navigate("/auth");
    } catch (error: any) {
      console.error("[ResetPassword] Error in password reset:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הסיסמה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">איפוס סיסמה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="סיסמה חדשה"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="אימות סיסמה"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-right"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "מעדכן..." : "עדכן סיסמה"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;