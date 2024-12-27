import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Action } from "@/components/ActionSelector";

const defaultActions: Omit<Action, "isSelected">[] = [
  { id: "extra1", name: "בעיטה לשער" },
  { id: "extra2", name: "בעיטה מחוץ למסגרת" },
  { id: "extra3", name: "מסירת עומק" },
  { id: "extra4", name: "מעבר שחקן 1 על 1" },
  { id: "extra5", name: "חילוץ כדור" },
  { id: "extra6", name: "כדור ראשון" },
  { id: "extra7", name: "חיפוי" },
  { id: "extra8", name: "בלימה" },
  { id: "extra9", name: "הגבהה" },
  { id: "extra10", name: "כדור שני" },
  { id: "extra11", name: "חסימה" },
  { id: "extra12", name: "בניית התקפה" }
];

interface AdditionalActionsProps {
  onActionSelect: (action: Action) => void;
}

export const AdditionalActions = ({ onActionSelect }: AdditionalActionsProps) => {
  const { toast } = useToast();
  const [customAction, setCustomAction] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const handleActionToggle = (actionId: string, actionName: string) => {
    if (selectedActions.includes(actionId)) {
      setSelectedActions(prev => prev.filter(id => id !== actionId));
    } else {
      setSelectedActions(prev => [...prev, actionId]);
      onActionSelect({
        id: actionId,
        name: actionName,
        isSelected: true
      });
    }
  };

  const handleAddCustomAction = () => {
    if (!customAction.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס שם לפעולה",
        variant: "destructive",
      });
      return;
    }

    const newAction: Action = {
      id: `custom-${Date.now()}`,
      name: customAction,
      isSelected: true
    };

    onActionSelect(newAction);
    setCustomAction("");
    toast({
      title: "פעולה נוספה",
      description: "הפעולה המותאמת אישית נוספה בהצלחה",
    });
  };

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold text-right mb-4">פעולות נוספות</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultActions.map(action => (
          <div 
            key={action.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Checkbox
              id={action.id}
              checked={selectedActions.includes(action.id)}
              onCheckedChange={() => handleActionToggle(action.id, action.name)}
            />
            <label
              htmlFor={action.id}
              className="text-right flex-grow mr-2 cursor-pointer"
            >
              {action.name}
            </label>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-6">
        <Button 
          onClick={handleAddCustomAction}
          variant="outline"
        >
          הוסף
        </Button>
        <Input
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
          placeholder="הוסף פעולה מותאמת אישית"
          className="text-right"
        />
      </div>
    </div>
  );
};