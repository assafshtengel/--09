import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Check, Plus, Target, Activity, Shield, Goal, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { basketballActions } from "@/utils/sportActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Action {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
  description?: string;
}

const getActionIcon = (index: number) => {
  const icons = [Target, Goal, Activity, Shield, CircleDot];
  const Icon = icons[index % icons.length];
  return <Icon className="h-6 w-6" />;
};

const getPositionActions = async (position: string, sportBranch?: string): Promise<Action[]> => {
  // If it's basketball, return basketball-specific actions
  if (sportBranch === 'basketball') {
    return basketballActions.map((action, index) => ({
      id: (index + 1).toString(),
      name: action.name,
      description: action.description,
      isSelected: false
    }));
  }

  const actions: { [key: string]: Array<{ name: string; description: string }> } = {
    havaya: [
      { name: "מנהיג", description: "מוביל ומנחה את הקבוצה בזמן אמת" },
      { name: "אגרסיבי", description: "משחק בעוצמה ובנחישות" },
      { name: "נחוש", description: "מראה נחישות בכל מהלך" },
      { name: "לוחם", description: "לא מפחד להילחם על הכדור" },
      { name: "אקטיבי", description: "תמיד בתנועה ובפעולה" },
      { name: "מחייך", description: "שומר על חיוך גם במצבים קשים" },
      { name: "קליל", description: "משחק בצורה קלילה ונעימה" },
      { name: "רגוע", description: "שומר על רוגע גם בלחץ" },
      { name: "משוחרר", description: "משחק בצורה חופשית וזורמת" },
      { name: "מתאמן", description: "שואף להשתפר כל הזמן" },
      { name: "אנרגטי", description: "מכניס אנרגיה לכל מהלך" },
      { name: "ממוקד", description: "שומר על מיקוד במטרה" },
      { name: "דומיננטי", description: "מוביל את הקבוצה קדימה" },
      { name: "אמיץ", description: "לא מפחד לקחת סיכונים" },
      { name: "אחראי", description: "לוקח אחריות על המהלכים" },
      { name: "מפתיע", description: "יודע להפתיע את היריב" },
      { name: "חברותי", description: "יוצר קשרים טובים עם השחקנים" },
      { name: "תחרותי", description: "שואף לנצח בכל מצב" },
      { name: "חושב קדימה", description: "מתכנן את המהלכים הבאים" },
      { name: "מהיר", description: "פועל במהירות וביעילות" },
      { name: "חזק", description: "מראה כוח פיזי במגרש" },
      { name: "מדויק", description: "מבצע מהלכים מדויקים" },
      { name: "מתכנן", description: "מתכנן את המהלכים בצורה חכמה" },
      { name: "מנוסה", description: "יש לו ניסיון רב במגרש" },
      { name: "קשוב", description: "קשוב לצרכים של הקבוצה" },
      { name: "מכוון מטרה", description: "יודע מה המטרה שלו" },
      { name: "יצירתי", description: "ממציא מהלכים חדשים" },
      { name: "מעורר השראה", description: "מעורר השראה בשחקנים אחרים" },
      { name: "חכם", description: "מקבל החלטות חכמות" },
      { name: "מתלהב", description: "מראה התלהבות בכל מהלך" },
      { name: "מאוזן", description: "שומר על איזון במגרש" },
      { name: "מתמודד עם לחץ", description: "יודע להתמודד עם מצבים קשים" },
      { name: "מהפנט", description: "יודע למשוך את תשומת הלב" },
      { name: "מדבר בשפת הגוף", description: "שפת הגוף שלו מדברת בעד עצמה" },
      { name: "יוזם", description: "יודע לקחת יוזמה" }
    ],
    forward: [
      { name: "בעיטה לשער", description: "יכולת לסיים מהלכים בדיוק ובעוצמה" },
      { name: "תנועה ללא כדור", description: "יצירת מרחבים והזדמנויות להתקפה" },
      { name: "נוכחות ברחבה", description: "נוכחות מתמדת באזור השער" },
      { name: "לחץ על ההגנה", description: "יודע להפעיל לחץ על ההגנה" },
      { name: "דריבל מוצלח", description: "יכולת לעבור שחקנים" },
      { name: "הורדת כדור בנגיעה", description: "יכולת להוריד כדור בצורה מדויקת" },
      { name: "מסירה מקדמת", description: "מסירות שמקדמות את המשחק" },
      { name: "ריצה לעומק", description: "יודע לרוץ לעומק וליצור מצבים" },
      { name: "סגירה הגנתית", description: "יודע לסגור את ההגנה" },
      { name: "שיפור מיקום בסיום", description: "שיפור המיקום בזמן הסיום" }
    ],
    goalkeeper: [
      { name: "יציאה נכונה", description: "יודע לצאת בזמן הנכון" },
      { name: "עצירה 1 על 1", description: "יכולת לעצור בעיטות 1 על 1" },
      { name: "הגנה בקו", description: "שומר על קו ההגנה" },
      { name: "משחק רגל", description: "יודע לשחק עם הרגליים" },
      { name: "תקשורת עם ההגנה", description: "יודע לתקשר עם ההגנה" },
      { name: "עצירת בעיטות מרחוק", description: "יכולת לעצור בעיטות מרחוק" },
      { name: "עצירת קרנות", description: "יודע לעצור קרנות" },
      { name: "צמצום זוויות", description: "יודע לצמצם זוויות" },
      { name: "התחלת התקפה מהירה", description: "יודע להתחיל התקפה במהירות" },
      { name: "קבלת החלטות תחת לחץ", description: "מקבל החלטות טובות תחת לחץ" }
    ],
    defender: [
      { name: "חיפוי נכון", description: "יודע לחפות על שחקנים אחרים" },
      { name: "תיקול מדויק", description: "יכולת לבצע תיקולים מדויקים" },
      { name: "משחק אווירי", description: "יודע לשחק במשחק אווירי" },
      { name: "בניית משחק", description: "יודע לבנות משחק בצורה חכמה" },
      { name: "קריאת משחק", description: "יודע לקרוא את המשחק" },
      { name: "תקשורת עם השוער", description: "יודע לתקשר עם השוער" },
      { name: "הובלת קו הגנה", description: "יודע להוביל את קו ההגנה" },
      { name: "סגירת מרווחים", description: "יודע לסגור מרווחים" },
      { name: "יציאה נכונה לכדור", description: "יודע לצאת לכדור בזמן" },
      { name: "מיקום נכון", description: "יודע למקם את עצמו נכון" },
      { name: "תזמון התערבות", description: "יודע לתזמן התערבויות" },
      { name: "שמירה על קו ישר", description: "יודע לשמור על קו ישר" }
    ],
    centerback: [
      { name: "חיפוי נכון", description: "יודע לחפות על שחקנים אחרים" },
      { name: "תיקול מדויק", description: "יכולת לבצע תיקולים מדויקים" },
      { name: "משחק אווירי", description: "יודע לשחק במשחק אווירי" },
      { name: "בניית משחק", description: "יודע לבנות משחק בצורה חכמה" },
      { name: "קריאת משחק", description: "יודע לקרוא את המשחק" },
      { name: "תקשורת עם השוער", description: "יודע לתקשר עם השוער" },
      { name: "הובלת קו הגנה", description: "יודע להוביל את קו ההגנה" },
      { name: "סגירת מרווחים", description: "יודע לסגור מרווחים" },
      { name: "יציאה נכונה לכדור", description: "יודע לצאת לכדור בזמן" },
      { name: "מיקום נכון", description: "יודע למקם את עצמו נכון" },
      { name: "תזמון התערבות", description: "יודע לתזמן התערבויות" },
      { name: "שמירה על קו ישר", description: "יודע לשמור על קו ישר" }
    ],
    winger: [
      { name: "כדרור מהיר", description: "יכולת לכדרר במהירות" },
      { name: "מסירות חדות", description: "מסירות מדויקות וחדות" },
      { name: "חיתוכים לעומק", description: "יודע לחתוך לעומק" },
      { name: "הגנה על הכדור", description: "יודע להגן על הכדור" },
      { name: "משחק גב לשער", description: "יודע לשחק גב לשער" },
      { name: "תנועה ללא כדור", description: "יודע לנוע ללא כדור" },
      { name: "הגבהות מדויקות", description: "יכולת להגביה כדורים מדויקים" },
      { name: "סיומת מהאגף", description: "יכולת לסיים מהאגף" },
      { name: "חזרה להגנה", description: "יודע לחזור להגנה" },
      { name: "יצירת מצבים", description: "יודע ליצור מצבים" },
      { name: "תיאום עם החלוץ", description: "יודע לתאם עם החלוץ" },
      { name: "שמירת רוחב מגרש", description: "יודע לשמור על רוחב המגרש" }
    ],
    midfielder: [
      { name: "חילוץ בקישור", description: "יכולת לחלץ כדורים בקישור" },
      { name: "מסירה קדימה", description: "מסירות שמקדמות את המשחק" },
      { name: "ניהול קצב", description: "יודע לנהל את קצב המשחק" },
      { name: "הרמת הראש", description: "יודע להרים את הראש ולראות את המגרש" },
      { name: "תמיכה בהתקפה", description: "תומך בהתקפה בצורה טובה" },
      { name: "חילוץ כדורים גבוה", description: "יכולת לחלץ כדורים גבוה" },
      { name: "מסירה ארוכה מדויקת", description: "מסירות ארוכות מדויקות" },
      { name: "תנועה בין הקווים", description: "יודע לנוע בין הקווים" },
      { name: "שמירה על פוזשן", description: "יודע לשמור על פוזשן" },
      { name: "יצירת יתרון מספרי", description: "יודע ליצור יתרון מספרי" }
    ]
  };

  const positionActions = actions[position] || [];
  return positionActions.map((action, index) => ({
    id: (index + 1).toString(),
    name: action.name,
    description: action.description,
    isSelected: false
  }));
};

interface ActionSelectorProps {
  position: string;
  onSubmit: (actions: Action[]) => void;
}

export const ActionSelector = ({ position, onSubmit }: ActionSelectorProps) => {
  const { toast } = useToast();
  const [customAction, setCustomAction] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Fetch user's sport branch from profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('profiles')
        .select('sport_branches')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const sportBranch = profile?.sport_branches?.[0];

  // Fetch actions based on position and sport branch
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['actions', position, sportBranch],
    queryFn: () => getPositionActions(position, sportBranch)
  });

  const [selectedActions, setSelectedActions] = useState<Action[]>([]);

  const handleActionToggle = (actionId: string) => {
    setSelectedActions(prevActions => {
      const action = actions.find(a => a.id === actionId);
      if (!action) return prevActions;

      const isCurrentlySelected = prevActions.some(a => a.id === actionId);
      if (isCurrentlySelected) {
        return prevActions.filter(a => a.id !== actionId);
      } else {
        return [...prevActions, { ...action, isSelected: true }];
      }
    });
  };

  const handleGoalChange = (actionId: string, goal: string) => {
    setSelectedActions(prevActions => 
      prevActions.map(action => 
        action.id === actionId 
          ? { ...action, goal }
          : action
      )
    );
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
      id: `custom-${Date.now()}`,
      name: customAction,
      description: customDescription,
      isSelected: true,
      goal: "",
    };

    setSelectedActions(prev => [...prev, newAction]);
    setCustomAction("");
    setCustomDescription("");
    setShowCustomForm(false);
    toast({
      title: "פעולה נוספה",
      description: "הפעולה המותאמת אישית נוספה בהצלחה",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedActions.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא בחר לפחות פעולה אחת",
        variant: "destructive",
      });
      return;
    }

    const missingGoals = selectedActions.some(action => !action.goal);
    if (missingGoals) {
      toast({
        title: "שגיאה",
        description: "אנא הגדר יעד לכל הפעולות שנבחרו",
        variant: "destructive",
      });
      return;
    }

    onSubmit(selectedActions);
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-right">בחר פעולות למעקב</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const isSelected = selectedActions.some(a => a.id === action.id);
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative p-4 rounded-lg border transition-all duration-200
                  ${isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50'}
                `}
              >
                <button
                  type="button"
                  onClick={() => handleActionToggle(action.id)}
                  className="w-full text-right"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      )}
                      {getActionIcon(index)}
                    </div>
                    <div className="flex-grow text-right">
                      <h3 className="font-medium text-lg">{action.name}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8">
          {!showCustomForm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCustomForm(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              הוסף פעולה מותאמת אישית
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 p-4 border rounded-lg bg-card"
            >
              <Input
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="שם הפעולה"
                className="text-right"
              />
              <Input
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="תיאור קצר של הפעולה"
                className="text-right"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addCustomAction}
                  className="flex-1"
                >
                  הוסף
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCustomForm(false)}
                >
                  ביטול
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {selectedActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-muted/50 rounded-lg"
          >
            <h3 className="font-medium mb-3 text-right">פעולות נבחרות:</h3>
            <div className="space-y-4">
              {selectedActions.map(action => (
                <div key={action.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-medium">{action.name}</span>
                  </div>
                  <Input
                    type="text"
                    value={action.goal || ""}
                    onChange={(e) => handleGoalChange(action.id, e.target.value)}
                    placeholder="הגדר יעד (לדוגמה: 5 פעולות)"
                    className="text-right mt-2"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full max-w-md mx-auto block mt-8 bg-primary hover:bg-primary-hover text-white"
      >
        המשך
      </Button>
    </form>
  );
};