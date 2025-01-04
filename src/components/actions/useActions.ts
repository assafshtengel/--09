import { useState } from "react";
import { Action } from "../ActionSelector";
import { useToast } from "@/components/ui/use-toast";

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
      "תיקול מוצלח",
      "הרחקת כדור",
      "יצירת רוחב",
      "מניעת הגבהה",
      "תמיכה בהתקפה",
      "סגירה נכונה בקו",
      "חיפוי על בלמים",
      "מסירות רוחב מדויקות",
      "נוכחות באגף",
      "התמודדות עם שחקן כנף"
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

export const useActions = (position: string) => {
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

  return {
    actions,
    customAction,
    setCustomAction,
    handleActionToggle,
    handleGoalChange,
    addCustomAction
  };
};