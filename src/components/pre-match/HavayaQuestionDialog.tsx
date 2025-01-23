import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HavayaQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  examples?: string[]; // Make examples optional
}

const traitDescriptions = {
  נחוש: "בעל רצון חזק להצליח ולהשיג מטרות",
  סבלני: "יכולת להמתין לרגע הנכון ולא למהר",
  יוזם: "לוקח אחריות ומתחיל פעולות",
  מנהיג: "מוביל ומכוון את הקבוצה",
  אסרטיבי: "מביע את עצמו בביטחון ובכבוד",
  גמיש: "מסתגל בקלות למצבים משתנים",
  כריזמטי: "בעל יכולת משיכה והשפעה טבעית",
  מחייך: "משרה אווירה חיובית",
  מתמסר: "נותן את כולו למען המטרה",
  אקטיבי: "פעיל ומעורב באופן מתמיד",
  מאוזן: "שומר על יציבות רגשית ומנטלית",
  מפוקס: "ממוקד במטרה ובמשימה",
  שאפתן: "בעל שאיפות גבוהות להצלחה",
  יצירתי: "חושב מחוץ לקופסה ומוצא פתרונות",
  חופשי: "פועל בטבעיות וללא מגבלות",
  נאמן: "מחויב לקבוצה ולמטרות",
  עירני: "ער למתרחש סביבו",
  בטוח: "בעל ביטחון עצמי",
  מאמין: "בעל אמונה ביכולות",
  ממוקד: "מרוכז במטרה",
  סוחף: "מעורר השראה באחרים",
  לוחם: "נלחם עד הסוף",
  חיובי: "בעל גישה אופטימית",
  נהנה: "מפיק הנאה מהמשחק",
  קליל: "משוחרר מלחץ",
  אמיץ: "מוכן להתמודד עם אתגרים",
  יעיל: "משיג תוצאות טובות",
  מוביל: "מוביל את הקבוצה קדימה",
  משוחרר: "פועל ללא מתח",
  נוכח: "מעורב ומשפיע במשחק",
  שקט: "שומר על קור רוח",
  רגוע: "פועל בשלווה",
  אנרגטי: "מלא מרץ ומוטיבציה",
  מחויב: "מסור למטרה ולקבוצה",
};

export const HavayaQuestionDialog = ({
  open,
  onOpenChange,
  category,
  examples = [], // Provide default empty array
}: HavayaQuestionDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">סגור</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-right flex items-center justify-between">
            <span>דוגמאות ל{category}</span>
            <div className="text-sm text-muted-foreground">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                    <Info className="h-4 w-4" />
                    הערה חשובה
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 text-right">
                  <p className="text-sm text-muted-foreground">
                    לא ניתן לבחור הוויות מתוך חלון זה. אנא חזור למסך הקודם כדי לבחור את ההוויות שלך.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] w-full pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {Object.entries(traitDescriptions).map(([trait, description]) => (
              <div
                key={trait}
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg space-y-2 transition-colors"
              >
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <h3 className="font-medium text-right cursor-help">{trait}</h3>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm text-right">{description}</p>
                  </HoverCardContent>
                </HoverCard>
                <p className="text-sm text-gray-600 text-right">{description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleClose}
            variant="outline"
            className="min-w-[120px]"
          >
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};