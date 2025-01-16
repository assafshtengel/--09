import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Check, Plus, Target, Activity, Shield, Goal, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const getPositionActions = (position: string): Action[] => {
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
  const [actions, setActions] = useState<Action[]>(getPositionActions(position));
  const [customAction, setCustomAction] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

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
      description: customDescription,
      isSelected: true,
      goal: "",
    };

    setActions([...actions, newAction]);
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
    const selectedActions = actions.filter(action => action.isSelected);
    
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-right mb-4">בחר פעולות למעקב</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-4 rounded-lg border transition-all duration-200
                ${action.isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <button
                type="button"
                onClick={() => handleActionToggle(action.id)}
                className="w-full text-right"
              >
                <div className="flex items-start gap-3 mb-2">
                  {getActionIcon(index)}
                  <div className="flex-grow">
                    <h3 className="font-medium">{action.name}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  {action.isSelected && (
                    <Check className="h-5 w-5 text-primary shrink-0" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {action.isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <Input
                      type="text"
                      value={action.goal || ""}
                      onChange={(e) => handleGoalChange(action.id, e.target.value)}
                      placeholder="הגדר יעד (לדוגמה: 5 פעולות)"
                      className="text-right"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
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
              className="space-y-3 p-4 border rounded-lg"
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

        {actions.some(action => action.isSelected) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-muted/50 rounded-lg"
          >
            <h3 className="font-medium mb-3">פעולות נבחרות:</h3>
            <div className="space-y-2">
              {actions.filter(a => a.isSelected).map(action => (
                <div key={action.id} className="flex items-center justify-between text-sm">
                  <span>{action.name}</span>
                  <span className="text-muted-foreground">{action.goal || 'טרם הוגדר יעד'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full max-w-md mx-auto block mt-8"
        style={{ 
          backgroundColor: "#0043CE",
          color: "white",
        }}
        className="hover:bg-[#007BFF] transition-colors"
      >
        המשך
      </Button>
    </form>
