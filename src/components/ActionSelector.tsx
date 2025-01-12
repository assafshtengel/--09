import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

export interface Action {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

const getPositionActions = (position: string): Action[] => {
  const actions: { [key: string]: string[] } = {
    forward: [
      "בעיטה לשער",
      "תנועה ללא כדור",
      "נוכחות ברחבה",
      "לחץ על ההגנה",
      "דריבל מוצלח",
      "הורדת כדור בנגיעה",
      "מסירה מקדמת",
      "ריצה לעומק",
      "סגירה הגנתית",
      "שיפור מיקום בסיום"
    ],
    goalkeeper: [
      "יציאה נכונה",
      "עצירה 1 על 1",
      "הגנה בקו",
      "משחק רגל",
      "תקשורת עם ההגנה",
      "עצירת בעיטות מרחוק",
      "עצירת קרנות",
      "צמצום זוויות",
      "התחלת התקפה מהירה",
      "קבלת החלטות תחת לחץ"
    ],
    defender: [
      "חיפוי נכון",
      "תיקול מדויק",
      "משחק אווירי",
      "בניית משחק",
      "קריאת משחק",
      "תקשורת עם השוער",
      "הובלת קו הגנה",
      "סגירת מרווחים",
      "יציאה נכונה לכדור",
      "מיקום נכון",
      "תזמון התערבות",
      "שמירה על קו ישר"
    ],
    centerback: [
      "חיפוי נכון",
      "תיקול מדויק",
      "משחק אווירי",
      "בניית משחק",
      "קריאת משחק",
      "תקשורת עם השוער",
      "הובלת קו הגנה",
      "סגירת מרווחים",
      "יציאה נכונה לכדור",
      "מיקום נכון",
      "תזמון התערבות",
      "שמירה על קו ישר"
    ],
    winger: [
      "כדרור מהיר",
      "מסירות חדות",
      "חיתוכים לעומק",
      "הגנה על הכדור",
      "משחק גב לשער",
      "תנועה ללא כדור",
      "הגבהות מדויקות",
      "סיומת מהאגף",
      "חזרה להגנה",
      "יצירת מצבים",
      "תיאום עם החלוץ",
      "שמירת רוחב מגרש"
    ],
    midfielder: [
      "חילוץ בקישור",
      "מסירה קדימה",
      "ניהול קצב",
      "הרמת הראש",
      "תמיכה בהתקפה",
      "חילוץ כדורים גבוה",
      "מסירה ארוכה מדויקת",
      "תנועה בין הקווים",
      "שמירה על פוזשן",
      "יצירת יתרון מספרי"
    ]
  };

  const positionActions = actions[position] || [];
  return positionActions.map((name, index) => ({
    id: (index + 1).toString(),
    name,
    isSelected: false
  }));
};

interface ActionSelectorProps {
  position: string;
  onSubmit: (actions: Action[]) => void;
}

export const ActionSelector = ({ position, onSubmit }: ActionSelectorProps) => {
  const { toast } = useToast();
  const [actions, setActions] = useState<Action[]>(getPositionActions(position));
  const [customAction, setCustomAction] = useState("");

  const handleActionToggle = (actionId: string) => {
    setActions(actions.map(action => 
      action.id === actionId 
        ? { ...action, isSelected: !action.isSelected }
        : action
    ));
  };

  const handleGoalChange = (actionId: string, goal: string) => {
    setActions(actions.map(action => 
      action.id === actionId 
        ? { ...action, goal }
        : action
    ));
  };

  const addCustomAction = () => {
    if (!customAction.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס שם לפעולה המותאמת אישית",
        variant: "destructive",
      });
      return;
    }

    const newAction: Action = {
      id: `custom-${actions.length + 1}`,
      name: customAction,
      isSelected: true,
      goal: "",
    };

    setActions([...actions, newAction]);
    setCustomAction("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedActions = actions.filter(action => action.isSelected);
    
    if (selectedActions.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא בחר לפחות פעולה אחת",
        variant: "destructive",
      });
      return;
    }

    onSubmit(selectedActions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-xl mx-auto p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-right mb-4">בחר פעולות למעקב</h2>
        
        {actions.map(action => (
          <div key={action.id} className="flex flex-col space-y-2 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Checkbox
                id={action.id}
                checked={action.isSelected}
                onCheckedChange={() => handleActionToggle(action.id)}
              />
              <label htmlFor={action.id} className="text-right flex-grow mr-2">
                {action.name}
              </label>
            </div>
            
            {action.isSelected && (
              <div className="mt-2">
                <Input
                  type="text"
                  value={action.goal || ""}
                  onChange={(e) => handleGoalChange(action.id, e.target.value)}
                  placeholder="הגדר יעד (לדוגמה: 5 פעולות)"
                  className="text-right"
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={addCustomAction}
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

      <Button type="submit" className="w-full">
        המשך
      </Button>
    </form>
  );
};