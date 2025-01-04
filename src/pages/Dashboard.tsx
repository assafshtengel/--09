import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreMatchReport {
  id: string;
  match_date: string;
  opponent?: string;
  havaya?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<PreMatchReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setProfile(profileData);

          // Fetch all pre-match reports for the user
          const { data: reportsData, error } = await supabase
            .from('pre_match_reports')
            .select('*')
            .eq('player_id', user.id)
            .order('match_date', { ascending: false });

          if (error) throw error;
          setReports(reportsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getProfile();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-right">
        {profile ? `ברוך הבא, ${profile.full_name}` : 'טוען...'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-right mb-4">פעולות מהירות</h2>
          <Button 
            onClick={() => navigate('/pre-match-report')}
            className="w-full"
          >
            דוח טרום משחק חדש
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-right mb-4">דוחות קודמים</h2>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/pre-match-summary/${report.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <p className="font-medium">
                          {format(new Date(report.match_date), 'dd/MM/yyyy')}
                        </p>
                        {report.opponent && (
                          <p className="text-sm text-gray-600">
                            נגד: {report.opponent}
                          </p>
                        )}
                        {report.havaya && (
                          <p className="text-sm text-gray-600">
                            הוויה: {report.havaya}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">אין דוחות קודמים</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}