import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PreMatchReport } from "@/components/game/history/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Camera, ExternalLink } from "lucide-react";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const PreMatchReportsList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<PreMatchReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PreMatchReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("pre_match_reports")
        .select("*, profiles(full_name)")
        .order("match_date", { ascending: false });

      if (error) throw error;
      
      const transformedReports: PreMatchReport[] = (data || []).map(report => {
        const actions = Array.isArray(report.actions) 
          ? report.actions.map((action: any) => ({
              name: String(action.name || ""),
              goal: action.goal ? String(action.goal) : undefined,
              id: String(action.id || ""),
              isSelected: Boolean(action.isSelected)
            }))
          : [];
          
        const questions_answers = Array.isArray(report.questions_answers)
          ? report.questions_answers.map((qa: any) => ({
              question: String(qa.question || ""),
              answer: String(qa.answer || "")
            }))
          : [];

        return {
          id: report.id,
          match_date: report.match_date,
          opponent: report.opponent,
          actions,
          questions_answers,
          havaya: report.havaya,
          status: report.status,
          created_at: report.created_at,
          updated_at: report.updated_at
        };
      });

      setReports(transformedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("שגיאה בטעינת הדוחות");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleScreenshot = async () => {
    try {
      const element = document.getElementById("report-content");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `pre-match-report-${selectedReport?.match_date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("הדוח נשמר בהצלחה");
    } catch (error) {
      console.error("Error generating screenshot:", error);
      toast.error("שגיאה בשמירת הדוח");
    }
  };

  const openPreparationGuide = () => {
    window.open("https://chatgpt.com/g/g-6780940ac570819189306621c59a067f-hhknh-shly-lmshkhq", "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">טוען...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">דוחות טרום משחק</h1>
        <Button
          onClick={() => navigate("/pre-match-report")}
          className="bg-primary text-white hover:bg-primary/90"
        >
          דוח חדש
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">לא נמצאו דוחות טרום משחק</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="cursor-pointer hover:bg-gray-50 transition-all"
            >
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg">
                  נגד: {report.opponent || "ללא יריב"}
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {formatDate(report.match_date)}
                </span>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              דוח טרום משחק - {selectedReport?.opponent || "ללא יריב"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh]">
            <div id="report-content" className="space-y-6 p-4">
              {selectedReport?.havaya && (
                <Card>
                  <CardHeader>
                    <CardTitle>הוויות נבחרות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.havaya.split(",").map((havaya, index) => (
                        <Badge key={index} variant="secondary">
                          {havaya.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedReport?.actions && selectedReport.actions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>יעדים למשחק</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedReport.actions.map((action, index) => (
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
                  </CardContent>
                </Card>
              )}

              {selectedReport?.questions_answers && selectedReport.questions_answers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>תשובות לשאלות</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedReport.questions_answers.map((qa, index) => (
                      <div
                        key={index}
                        className="border p-3 rounded-lg bg-muted/50"
                      >
                        <div className="font-medium">{qa.question}</div>
                        <div className="text-sm mt-1">{qa.answer}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-6 p-4">
              <Button
                onClick={handleScreenshot}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <Camera className="h-4 w-4" />
                שמור צילום מסך
              </Button>

              <Button
                onClick={openPreparationGuide}
                className="w-full flex items-center justify-center gap-2"
                variant="default"
              >
                <ExternalLink className="h-4 w-4" />
                קבל דוח הכנה מלא
              </Button>

              <p className="text-sm text-gray-500 text-center mt-2">
                קבל דוח הכנה מלא לקראת המשחק. מומלץ לקרוא את הדוח מספר פעמים כדי להתמקד.
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreMatchReportsList;