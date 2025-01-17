import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { FileText, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PreMatchReport {
  id: string;
  match_date: string;
  opponent: string | null;
  actions: any[];
  questions_answers: any[];
  havaya?: string;
  status: 'draft' | 'completed';
}

export const PreMatchReportsList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<PreMatchReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<PreMatchReport | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("pre_match_reports")
          .select("*")
          .eq("player_id", user.id)
          .order("match_date", { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("שגיאה בטעינת הדוחות");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div className="text-center p-8">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="ml-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">דוחות טרום משחק</h1>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedReport(report)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {format(new Date(report.match_date), "dd/MM/yyyy", { locale: he })}
                </span>
                <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                  {report.status === "completed" ? "הושלם" : "טיוטה"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <p>נגד: {report.opponent || "לא צוין"}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            לא נמצאו דוחות טרום משחק
          </div>
        )}
      </div>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-right">
              דוח טרום משחק - {selectedReport?.opponent}
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">תאריך משחק</h3>
                <p>{format(new Date(selectedReport.match_date), "dd/MM/yyyy", { locale: he })}</p>
              </div>

              {selectedReport.havaya && (
                <div>
                  <h3 className="font-semibold mb-2">הוויות נבחרות</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.havaya.split(',').map((havaya, index) => (
                      <Badge key={index} variant="secondary">
                        {havaya.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">יעדים למשחק</h3>
                <div className="grid gap-3">
                  {selectedReport.actions.map((action: any, index: number) => (
                    <div
                      key={index}
                      className="border p-3 rounded-lg bg-muted/50"
                    >
                      <div className="font-medium">{action.name}</div>
                      {action.goal && (
                        <div className="text-sm text-muted-foreground mt-1">
                          יעד: {action.goal}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.questions_answers && selectedReport.questions_answers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">שאלות ותשובות</h3>
                  <div className="space-y-3">
                    {selectedReport.questions_answers.map((qa: any, index: number) => (
                      <div key={index} className="border p-3 rounded-lg">
                        <div className="font-medium">{qa.question}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {qa.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreMatchReportsList;