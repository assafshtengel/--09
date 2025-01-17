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
import { toast } from "sonner";
import { PreMatchReport } from "@/components/game/history/types";

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
        .select("*")
        .order("match_date", { ascending: false });

      if (error) throw error;
      
      // Cast the data to PreMatchReport[] type
      const typedReports = (data || []) as PreMatchReport[];
      setReports(typedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("שגיאה בטעינת הדוחות");
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold">דוחות טרום משחק</h1>
        <button
          onClick={() => navigate("/pre-match-report")}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          דוח חדש
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">לא נמצאו דוחות טרום משחק</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Dialog key={report.id}>
              <DialogTrigger asChild>
                <div
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {report.opponent || "ללא יריב"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(report.match_date).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <Badge
                      variant={report.status === "completed" ? "default" : "secondary"}
                    >
                      {report.status === "completed" ? "הושלם" : "טיוטה"}
                    </Badge>
                  </div>
                  {report.havaya && (
                    <div className="mt-2">
                      <Badge variant="outline">{report.havaya}</Badge>
                    </div>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    דוח טרום משחק - {selectedReport?.opponent || "ללא יריב"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {selectedReport?.match_date &&
                        new Date(selectedReport.match_date).toLocaleDateString(
                          "he-IL"
                        )}
                    </p>
                    <Badge
                      variant={
                        selectedReport?.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedReport?.status === "completed"
                        ? "הושלם"
                        : "טיוטה"}
                    </Badge>
                  </div>

                  {selectedReport?.havaya && (
                    <div>
                      <h3 className="font-semibold mb-2">חוויה נבחרת</h3>
                      <Badge variant="outline">{selectedReport.havaya}</Badge>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">יעדים למשחק</h3>
                    <div className="grid gap-3">
                      {Array.isArray(selectedReport?.actions) && selectedReport?.actions.map((action: any, index: number) => (
                        <div
                          key={index}
                          className="border p-3 rounded-lg bg-muted/50"
                        >
                          <p className="font-medium">{action.title}</p>
                          {action.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {action.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {Array.isArray(selectedReport?.questions_answers) && selectedReport?.questions_answers.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">שאלות ותשובות</h3>
                      <div className="space-y-3">
                        {selectedReport?.questions_answers.map(
                          (qa: any, index: number) => (
                            <div
                              key={index}
                              className="border p-3 rounded-lg bg-muted/50"
                            >
                              <p className="font-medium">{qa.question}</p>
                              <p className="text-sm mt-1">{qa.answer}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreMatchReportsList;