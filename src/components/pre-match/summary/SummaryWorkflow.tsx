import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Download, Calendar, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface SummaryWorkflowProps {
  reportId: string;
}

export const SummaryWorkflow = ({ reportId }: SummaryWorkflowProps) => {
  const navigate = useNavigate();
  const [showSaveDialog, setShowSaveDialog] = useState(true);
  const [showGuideDialog, setShowGuideDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [hasVisitedExternalSite, setHasVisitedExternalSite] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasVisitedExternalSite) {
        setShowReturnDialog(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasVisitedExternalSite]);

  const handleDownload = async () => {
    try {
      const element = document.getElementById("pre-match-summary");
      if (!element) {
        throw new Error("Summary element not found");
      }

      const canvas = await html2canvas(element);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`pre-match-report-${reportId}.pdf`);

      toast({
        title: "הדוח נשמר בהצלחה",
        description: "הקובץ נשמר במכשיר שלך",
      });

      setShowSaveDialog(false);
      setShowGuideDialog(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "שגיאה בשמירת הדוח",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handleGuideRedirect = () => {
    setShowGuideDialog(false);
    setHasVisitedExternalSite(true);
    window.open("https://did.li/texttogame", "_blank");
  };

  const handleScheduleRedirect = () => {
    navigate("/pre-game-planner");
  };

  return (
    <>
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>האם תרצה לשמור את הדוח במכשיר שלך?</AlertDialogTitle>
            <AlertDialogDescription>
              הדוח יישמר בפורמט PDF ותוכל לפתוח אותו בכל עת
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => {
              setShowSaveDialog(false);
              setShowGuideDialog(true);
            }}>
              לא
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              כן, שמור
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showGuideDialog} onOpenChange={setShowGuideDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>האם תרצה לקבל מדריך הכנה מפורט למשחק?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => setShowGuideDialog(false)}>
              לא
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleGuideRedirect}>
              כן
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>המלצה חשובה</AlertDialogTitle>
            <AlertDialogDescription>
              אנו ממליצים להעתיק את טקסט ההכנה לקבוצת הווטסאפ הפרטית שלך ולקרוא אותו מספר פעמים לפני המשחק
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowReturnDialog(false)}>
              הבנתי
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!showSaveDialog && !showGuideDialog && !showReturnDialog && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleScheduleRedirect}
            className="gap-2 text-lg"
            size="lg"
          >
            <Calendar className="h-5 w-5" />
            בוא ניצור תוכנית מפורטת עד למשחק
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
};