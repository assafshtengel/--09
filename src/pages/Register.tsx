import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const Register = () => {
  return (
    <div className="container mx-auto max-w-md p-8">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        view="sign_up"
        redirectTo={`${window.location.origin}/`}
      />
    </div>
  );
};