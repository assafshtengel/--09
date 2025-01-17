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
import { Calendar, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

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

  const handleScreenshot = async () => {
    try {
      const element = document.getElementById("pre-match-summary");
      if (!element) {
        throw new Error("Summary element not found");
      }

      // Set temporary styles to ensure all content is visible in one view
      const originalStyle = element.style.cssText;
      element.style.cssText = `
        position: relative;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        padding: 2rem;
        box-sizing: border-box;
      `;

      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
        windowHeight: element.scrollHeight,
      });

      // Restore original styles
      element.style.cssText = originalStyle;

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 1.0);
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pre-match-report-${reportId}.png`;
      
      // For mobile devices, try to use the device's native share if available
      if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        try {
          const file = new File([blob], `pre-match-report-${reportId}.png`, { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: 'Pre-Match Report',
          });
        } catch (error) {
          // Fallback to regular download if sharing fails
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Regular download for desktop
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      URL.revokeObjectURL(url);

      toast({
        title: "הדוח נשמר בהצלחה",
        description: "התמונה נשמרה במכשיר שלך",
      });

      setShowSaveDialog(false);
      setShowGuideDialog(true);
    } catch (error) {
      console.error("Error generating screenshot:", error);
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
            <AlertDialogTitle>מעוניין לשמור את הדוח במחשב/פלאפון?</AlertDialogTitle>
            <AlertDialogDescription>
              הדוח יישמר כתמונה במכשיר שלך
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => {
              setShowSaveDialog(false);
              setShowGuideDialog(true);
            }}>
              לא
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleScreenshot}>
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