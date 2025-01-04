import { useState } from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HavayaSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const havayaOptions = [
  { value: "נחישות", description: "מצב של החלטיות ודבקות במטרה" },
  { value: "אגרסיביות", description: "גישה תקיפה ונחושה למשחק" },
  { value: "מנהיג", description: "לקיחת אחריות והובלת הקבוצה" },
  { value: "מחייך", description: "גישה חיובית ואופטימית למשחק" },
  { value: "אקטיבי", description: "מעורבות מתמדת ויוזמה במשחק" },
  { value: "לוחם", description: "נכונות להתמודד עם כל אתגר" },
  { value: "קליל", description: "גישה משוחררת ונינוחה למשחק" },
  { value: "משוחרר", description: "חופש מלחץ ודאגות" },
  { value: "רגוע", description: "שליטה עצמית ואיזון נפשי" },
  { value: "אנרגטי", description: "מלא מרץ ומוטיבציה" },
  { value: "מאמין", description: "בטחון ביכולות ובהצלחה" },
  { value: "בטוח", description: "תחושת ביטחון עצמי ויציבות" },
  { value: "ממוקד", description: "ריכוז מלא במטרות המשחק" },
  { value: "נלהב", description: "התלהבות והתרגשות חיובית" },
  { value: "דומיננטי", description: "נוכחות משמעותית במגרש" },
  { value: "יצירתי", description: "חשיבה מחוץ לקופסה ופתרונות יצירתיים" },
  { value: "תחרותי", description: "רצון עז להצליח ולנצח" },
  { value: "סבלני", description: "יכולת להמתין לרגע הנכון" },
  { value: "חכם", description: "קבלת החלטות נבונה ומחושבת" },
  { value: "תומך", description: "עזרה ותמיכה בחברי הקבוצה" },
  { value: "נחוש", description: "מיקוד מוחלט בהשגת המטרות" },
];

const MAX_SELECTIONS = 4;
const MIN_SELECTIONS = 3;

export const HavayaSelector = ({ value = [], onChange }: HavayaSelectorProps) => {
  const { toast } = useToast();

  const handleSelect = (havaya: string) => {
    if (value.includes(havaya)) {
      onChange(value.filter((v) => v !== havaya));
    } else {
      if (value.length >= MAX_SELECTIONS) {
        toast({
          title: "מקסימום בחירות",
          description: `ניתן לבחור עד ${MAX_SELECTIONS} הוויות`,
          variant: "destructive",
        });
        return;
      }
      onChange([...value, havaya]);
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">הוויה למשחק</h3>
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <Info className="h-4 w-4 text-muted-foreground" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 text-right p-4">
            <p className="text-sm text-gray-600">
              בחר {MIN_SELECTIONS}-{MAX_SELECTIONS} הוויות שילוו אותך במשחק. ההוויה היא מצב התודעה והגישה שאיתה
              אתה ניגש למשחק, והיא תשפיע על התנהגותך והביצועים שלך במגרש.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {havayaOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => handleSelect(option.value)}
              className={`w-full p-3 rounded-lg text-right transition-all ${
                value.includes(option.value)
                  ? "bg-primary text-white shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="space-y-1">
                <div className="font-medium">{option.value}</div>
                <p className={`text-xs ${value.includes(option.value) ? "text-white/80" : "text-gray-500"}`}>
                  {option.description}
                </p>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-gray-500">
          נבחרו {value.length} מתוך {MAX_SELECTIONS} הוויות
        </div>
        <div className="flex gap-2">
          {value.map((havaya) => (
            <Badge key={havaya} variant="secondary">
              {havaya}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
};