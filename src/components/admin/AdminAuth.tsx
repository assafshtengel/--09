import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AdminUserMetadata {
  isAdmin: boolean;
}

interface AdminCredentials {
  id: string;
  email: string;
  phone_number: string;
}

interface VerifyPasswordResponse {
  verified: boolean;
}

export const AdminAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: adminData, error: fetchError } = await supabase
        .from("admin_credentials")
        .select("*")
        .eq("email", formData.email)
        .eq("phone_number", formData.phoneNumber)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!adminData) {
        toast({
          title: "גישה נדחתה",
          description: "אנא נסה שנית",
          variant: "destructive",
        });
        return;
      }

      const { data: verifyData, error: verifyError } = await supabase.rpc<VerifyPasswordResponse>("verify_admin_password", {
        input_email: formData.email,
        input_password: formData.password,
      });

      if (verifyError || !verifyData?.verified) {
        toast({
          title: "גישה נדחתה",
          description: "אנא נסה שנית",
          variant: "destructive",
        });
        return;
      }

      // Set admin session with proper typing
      const metadata: AdminUserMetadata = { isAdmin: true };
      const { error: updateError } = await supabase.auth.updateUser({
        data: metadata
      });

      if (updateError) throw updateError;

      toast({
        title: "התחברת בהצלחה",
        description: "ברוך הבא לדף הניהול",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin auth error:", error);
      toast({
        title: "גישה נדחתה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const { error } = await supabase.functions.invoke("send-admin-credentials", {
        body: { email: formData.email }
      });
      
      if (error) throw error;

      toast({
        title: "פרטי התחברות נשלחו",
        description: "בדוק את תיבת הדואר שלך",
      });
    } catch (error) {
      console.error("Error sending credentials:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח את פרטי ההתחברות כרגע",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            כניסת מנהל
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="אימייל"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="סיסמה"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="מספר טלפון"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={handleForgotPassword}
            >
              שכחתי סיסמה
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};