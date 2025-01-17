import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Action } from "@/components/ActionSelector";

interface PreMatchReport {
  id: string;
  match_date: string;
  match_time?: string;
  opponent?: string;
  actions: Action[];
  questions_answers: Record<string, any>;
  havaya?: string;
  status: "draft" | "completed";
  created_at: string;
  updated_at: string;
  ai_insights?: string[];
}

export const PreMatchReportsList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<PreMatchReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PreMatchReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("pre_match_reports")
        .select("*")
        .order("match_date", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our PreMatchReport type
      const transformedData: PreMatchReport[] = data?.map(report => ({
        ...report,
        actions: Array.isArray(report.actions) ? report.actions : [],
        questions_answers: report.questions_answers || {},
      })) || [];
      
      setReports(transformedData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("שגיאה בטעינת הדוחות");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("pre_match_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      toast.success("הדוח נמחק בהצלחה");
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("שגיאה במחיקת הדוח");
    } finally {
      setIsDeleting(false);
    }
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
        <Button 
          variant="outline" 
          onClick={() => navigate("/pre-match-report")}
          className="flex items-center gap-2"
        >
          <ChevronRight className="h-4 w-4" />
          חזרה
        </Button>
        <h1 className="text-2xl font-bold">דוחות טרום משחק</h1>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">לא נמצאו דוחות טרום משחק</p>
          <Button 
            onClick={() => navigate("/pre-match-report")} 
            className="mt-4"
          >
            צור דוח חדש
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:bg-gray-50/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-right">
                    <h3 className="font-semibold">
                      {report.opponent ? `נגד ${report.opponent}` : "משחק"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(report.match_date), "dd/MM/yyyy")}
                      {report.match_time && ` ${report.match_time}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            פרטי דוח טרום משחק
                          </DialogTitle>
                        </DialogHeader>

                        <ScrollArea className="p-6">
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold mb-2">פרטי המשחק</h3>
                              <div className="space-y-2">
                                <p>תאריך: {format(new Date(report.match_date), "dd/MM/yyyy")}</p>
                                {report.opponent && <p>יריבה: {report.opponent}</p>}
                                {report.match_time && <p>שעה: {report.match_time}</p>}
                              </div>
                            </div>

                            {report.havaya && (
                              <div>
                                <h3 className="font-semibold mb-2">הוויה נבחרת</h3>
                                <Badge variant="outline">{report.havaya}</Badge>
                              </div>
                            )}

                            <div>
                              <h3 className="font-semibold mb-2">יעדים למשחק</h3>
                              <div className="space-y-2">
                                {report.actions.map((action, index) => (
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

                            <div>
                              <h3 className="font-semibold mb-2">תשובות לשאלות</h3>
                              <div className="space-y-3">
                                {Object.entries(report.questions_answers).map(
                                  ([question, answer], index) => (
                                    <div
                                      key={index}
                                      className="border p-3 rounded-lg bg-muted/50"
                                    >
                                      <p className="font-medium">{question}</p>
                                      <p className="text-sm mt-1">{answer as string}</p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(report.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <Badge
                    variant={report.status === "completed" ? "default" : "secondary"}
                  >
                    {report.status === "completed" ? "הושלם" : "טיוטה"}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    נוצר ב-{format(new Date(report.created_at), "dd/MM/yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreMatchReportsList;