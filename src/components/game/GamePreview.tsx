import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { AdditionalActions } from "./AdditionalActions";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

interface GamePreviewProps {
  actions: Action[];
  onActionAdd: (action: Action) => void;
  onStartMatch: () => void;
}

export const GamePreview = ({ actions, onActionAdd, onStartMatch }: GamePreviewProps) => {
  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('goals-preview');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = 'game-goals.png';
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "צילום מסך הושלם",
          description: "התמונה נשמרה בהצלחה",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לצלם את המסך",
        variant: "destructive",
      });
    }
  };

  return (
    <div id="goals-preview" className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-right mb-4">יעדי המשחק</h2>
        <div className="grid gap-3">
          {actions.map(action => (
            <div key={action.id} className="border p-3 rounded-lg text-right hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold">{action.name}</h3>
              {action.goal && (
                <p className="text-sm text-gray-600 mt-1">יעד: {action.goal}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <AdditionalActions onActionSelect={onActionAdd} />
      
      <div className="flex gap-3 justify-end">
        <Button onClick={takeScreenshot} variant="outline" size="sm">
          צלם מסך
        </Button>
        <Button onClick={onStartMatch} size="sm">
          המשך
        </Button>
      </div>
    </div>
  );
};
