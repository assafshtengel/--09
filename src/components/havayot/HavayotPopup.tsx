import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface HavayaItem {
  name: string;
  description: string;
}

interface HavayotPopupProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    name: string;
    description: string;
    havayot: HavayaItem[];
  };
}

export const HavayotPopup = ({ isOpen, onClose, category }: HavayotPopupProps) => {
  const [shuffledHavayot, setShuffledHavayot] = useState<HavayaItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const shuffled = [...category.havayot].sort(() => Math.random() - 0.5).slice(0, 15);
      setShuffledHavayot(shuffled);
    }
  }, [isOpen, category.havayot]);

  const getCategoryDescription = () => {
    if (category.name === "מקצועי (טכני/טקטי)") {
      return (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            בהוויה המקצועית, אתה בוחר להתמקד באספקטים הטכניים והטקטיים של המשחק. הבחירה שלך משקפת את ההתנהלות שלך כשחקן שמכוון לשפר את השליטה בכדור, להבין את המרחב סביבך, ולבצע מהלכים מדויקים ואחראיים על המגרש.
          </p>
          <div className="space-y-3">
            <p className="font-medium text-gray-800">דוגמאות להוויות מקצועיות:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="font-medium">סורק:</span>
                <span>מתמקד בסריקת המרחב סביבך כדי להיות צעד אחד לפני היריב ולקבל החלטות חכמות.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">מדויק למרחב:</span>
                <span>מבין וממקסם את המיקום האופטימלי שלך במגרש, תוך שליטה מלאה על תנועותיך.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">שיטתי:</span>
                <span>פועל לפי שיטה מסודרת ועקבית שמביאה אותך להישגים גבוהים.</span>
              </li>
            </ul>
          </div>
        </div>
      );
    }
    
    if (category.name === "מנטלי (גישה וחשיבה)") {
      return (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            בחירת הוויה מנטלית עוזרת לך להגדיר את הגישה שלך למשחק ולשלוט במחשבות ובתגובות שלך במגרש. המטרה היא להתמודד טוב יותר עם אתגרים, לשמור על ריכוז ולהתנהל בביטחון גם ברגעי לחץ.
          </p>
          <div className="space-y-3">
            <p className="font-medium text-gray-800">דוגמאות להוויות מנטליות:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="font-medium">מוכן ללחץ:</span>
                <span>בהוויה הזו אתה מתמודד עם מצבי לחץ במשחק באופן מחושב ורגוע. כשאתה בוחר להיות 'מוכן ללחץ', אתה מצליח לשמור על קור רוח ולקבל החלטות מהירות ונכונות גם במצבים קריטיים.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">זכיר:</span>
                <span>ההוויה הזו מתמקדת בהשארת חותם על המשחק. כשאתה 'זכיר', אתה מוביל מהלכים שמרשימים את הצופים, המאמן והקבוצה – ויוצר רגעים בלתי נשכחים.</span>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    return <p className="text-muted-foreground leading-relaxed text-sm text-right">{category.description}</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col gap-4">
        <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">סגור</span>
          </Button>
          <DialogHeader className="w-full">
            <DialogTitle className="text-xl md:text-2xl text-center">
              איזה שחקן הקבוצה תקבל היום?
            </DialogTitle>
            <div className="text-sm md:text-base">
              <h3 className="font-semibold mb-1 text-right">{category.name}</h3>
              {getCategoryDescription()}
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shuffledHavayot.map((havaya, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 transition-colors shadow-sm text-right pointer-events-none"
              >
                <h4 className="font-semibold text-base mb-1">{havaya.name}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{havaya.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 text-right">
            <p className="text-sm text-gray-500">
              אין אפשרות ללחוץ על ההוויות כאן. סגור את החלון ורשום את ההוויה שבחרת בתיבת הטקסט.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <p className="text-gray-700">
                <span className="font-bold">מומלץ</span> לבחור הוויה אחת בלבד באותו תחום על מנת שתוכל באמת להתמקד באיך שאתה רוצה להיות במגרש ובמשחק. כמובן, אין חובה לכך.
              </p>
              <p className="text-gray-700">
                ההוויות הן בגדר המלצות בלבד ואתה יכול לבחור כל הוויה שתרצה. העיקר שתתחבר אליה ותנסה להביא אותה למשחק.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 bg-white pt-2 text-center">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto"
            variant="default"
          >
            סגור וחזור לבחירת הוויה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};