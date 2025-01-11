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
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PreGamePlannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PreGamePlannerDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: PreGamePlannerDialogProps) => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onConfirm();
    navigate("/pre-game-planner");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-center">
            רוצה לקבל לוז מפורט עד למשחק?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg space-y-4 text-center">
            <div className="flex items-center justify-center gap-4 text-primary">
              <Calendar className="h-8 w-8" />
              <Clock className="h-8 w-8" />
            </div>
            <p>
              תכנון נכון הוא המפתח להצלחה! 
              קבל לוז מותאם אישית שיעזור לך להגיע למשחק במיטבך.
            </p>
            <div className="space-y-2 text-right">
              <p className="font-semibold">הלוז כולל:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>זמני ארוחות מומלצים</li>
                <li>שעות שינה אופטימליות</li>
                <li>זמני מנוחה</li>
                <li>פעילויות הכנה למשחק</li>
                <li>טיפים להצלחה</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:space-x-4">
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-primary hover:bg-primary/90"
          >
            כן, אשמח לקבל לוז
          </AlertDialogAction>
          <AlertDialogCancel onClick={onCancel}>
            לא תודה
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};