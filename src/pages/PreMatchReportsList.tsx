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
import { Camera, ExternalLink, Target, MessageSquare, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import html2canvas from 'html2canvas';

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
              <CardContent>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {report.actions?.length || 0} יעדים
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {report.questions_answers?.length || 0} תשובות
                  </span>
                </div>
              </CardContent>
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
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50"
                >
                  <h3 className="text-lg font-semibold mb-4 text-right flex items-center gap-2 justify-end">
                    <List className="h-5 w-5" />
                    הוויות נבחרות
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.havaya.split(",").map((havaya, index) => {
                      const cleanHavaya = havaya.trim().split('-').pop() || havaya.trim();
                      return (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="text-sm py-1 px-3"
                        >
                          {cleanHavaya}
                        </Badge>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {selectedReport?.actions && selectedReport.actions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-right flex items-center gap-2 justify-end">
                    <Target className="h-5 w-5" />
                    יעדים למשחק
                  </h3>
                  <div className="space-y-3">
                    {selectedReport.actions.map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border rounded-lg p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-end gap-4">
                          {action.goal && (
                            <span className="text-sm text-gray-600">יעד: {action.goal}</span>
                          )}
                          <span className="font-medium text-primary">{action.name}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedReport?.questions_answers && selectedReport.questions_answers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-right flex items-center gap-2 justify-end">
                    <MessageSquare className="h-5 w-5" />
                    תשובות לשאלות
                  </h3>
                  <div className="space-y-4">
                    {selectedReport.questions_answers.map((qa, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border p-4 rounded-lg bg-gray-50/50"
                      >
                        <p className="font-medium text-right mb-2">{qa.question}</p>
                        <p className="text-gray-600 text-right">{qa.answer}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
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