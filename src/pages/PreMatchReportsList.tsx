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
import { Camera, ExternalLink, Calendar } from "lucide-react";
import html2canvas from "html2canvas";

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
      
      // Transform the data to match our types
      const transformedReports: PreMatchReport[] = (data || []).map(report => ({
        ...report,
        actions: Array.isArray(report.actions) ? report.actions.map(action => ({
          name: String(action.name || ''),
          goal: action.goal ? String(action.goal) : undefined
        })) : [],
        questions_answers: Array.isArray(report.questions_answers) ? report.questions_answers.map(qa => ({
          question: String(qa.question || ''),
          answer: String(qa.answer || '')
        })) : []
      }));

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
      const element = document.getElementById('report-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `pre-match-report-${selectedReport?.match_date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("הדוח נשמר בהצלחה");
    } catch (error) {
      console.error('Error generating screenshot:', error);
      toast.error("שגיאה בשמירת הדוח");
    }
  };

  const openPreparationGuide = () => {
    window.open('https://chatgpt.com/g/g-6780940ac570819189306621c59a067f-hhknh-shly-lmshkhq', '_blank');
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
          <Calendar className="ml-2 h-4 w-4" />
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
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {formatDate(report.match_date)}
                </span>
                <h3 className="font-semibold">
                  נגד: {report.opponent || "ללא יריב"}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              דוח טרום משחק - {selectedReport?.opponent || "ללא יריב"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh]">
            <div id="report-content" className="space-y-6 p-4">
              {selectedReport?.havaya && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">חוויה נבחרת</h3>
                  <p>{selectedReport.havaya}</p>
                </div>
              )}

              <Separator />

              {selectedReport?.actions && selectedReport.actions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">יעדים למשחק</h3>
                  <div className="grid gap-3">
                    {selectedReport.actions.map((action, index) => (
                      <div
                        key={index}
                        className="border p-3 rounded-lg bg-muted/50"
                      >
                        <p className="font-medium">{action.name}</p>
                        {action.goal && (
                          <p className="text-sm text-gray-500 mt-1">
                            יעד: {action.goal}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {selectedReport?.questions_answers && selectedReport.questions_answers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">תשובות לשאלות</h3>
                  <div className="space-y-3">
                    {selectedReport.questions_answers.map((qa, index) => (
                      <div
                        key={index}
                        className="border p-3 rounded-lg bg-muted/50"
                      >
                        <p className="font-medium">{qa.question}</p>
                        <p className="text-sm mt-1">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
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