import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface MentalFeedbackSectionProps {
  feedback: {
    pressure_handling?: string;
    turning_points?: string;
    coach_feedback?: string;
    mental_coach_feedback?: string;
  };
  onFeedbackChange?: (field: string, value: string) => void;
  isEditable?: boolean;
}

export const MentalFeedbackSection = ({ 
  feedback, 
  onFeedbackChange,
  isEditable = false 
}: MentalFeedbackSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">משוב מנטלי</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-right block mb-2">
              איך התמודדת עם לחץ במהלך המשחק?
            </label>
            {isEditable ? (
              <Textarea
                value={feedback.pressure_handling || ""}
                onChange={(e) => onFeedbackChange?.("pressure_handling", e.target.value)}
                className="text-right"
                placeholder="תאר את ההתמודדות שלך עם לחץ..."
              />
            ) : (
              <p className="text-sm text-right">{feedback.pressure_handling || "-"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-right block mb-2">
              נקודות מפנה מנטליות
            </label>
            {isEditable ? (
              <Textarea
                value={feedback.turning_points || ""}
                onChange={(e) => onFeedbackChange?.("turning_points", e.target.value)}
                className="text-right"
                placeholder="תאר את נקודות המפנה המנטליות..."
              />
            ) : (
              <p className="text-sm text-right">{feedback.turning_points || "-"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-right block mb-2">
              משוב מאמן
            </label>
            <p className="text-sm text-right">{feedback.coach_feedback || "-"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-right block mb-2">
              משוב מאמן מנטלי
            </label>
            <p className="text-sm text-right">{feedback.mental_coach_feedback || "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};