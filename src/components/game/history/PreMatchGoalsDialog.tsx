import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface PreMatchGoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preMatchReport?: {
    actions: Json;
    havaya?: string;
    questions_answers: Json;
  };
}

export const PreMatchGoalsDialog = ({ isOpen, onClose, preMatchReport }: PreMatchGoalsDialogProps) => {
  if (!preMatchReport) return null;

  const havayaList = preMatchReport.havaya?.split(',') || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            יעדים והוויות טרום משחק
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {havayaList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">הוויות נבחרות</h3>
              <div className="flex flex-wrap gap-2">
                {havayaList.map((havaya, index) => (
                  <Badge key={index} variant="secondary">
                    {havaya.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">יעדים למשחק</h3>
            <div className="grid gap-3">
              {Array.isArray(preMatchReport.actions) &&
                preMatchReport.actions.map((action: any, index: number) => (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};