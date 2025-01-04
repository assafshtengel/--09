import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

interface HavayaSelectorProps {
  value: string;
  onChange: (value: string) => void;
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

export const HavayaSelector = ({ value, onChange }: HavayaSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
              בחר את ההוויה שתלווה אותך במשחק. ההוויה היא מצב התודעה והגישה שאיתה
              אתה ניגש למשחק, והיא תשפיע על התנהגותך והביצועים שלך במגרש.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      <Select 
        value={value} 
        onValueChange={onChange}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger 
          className={`w-full transition-all duration-200 ${
            isOpen ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
        >
          <SelectValue placeholder="בחר הוויה למשחק" />
        </SelectTrigger>
        <SelectContent>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {havayaOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="hover:bg-primary/5 transition-colors"
              >
                <div className="flex flex-col py-1">
                  <span className="font-medium">{option.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </motion.div>
        </SelectContent>
      </Select>
    </motion.div>
  );
};