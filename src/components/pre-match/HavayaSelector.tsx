import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id: matchId } = useParams();
  const [selectedHavayot, setSelectedHavayot] = useState<string[]>([]);

  const handleHavayaSelect = (havayaValue: string) => {
    setSelectedHavayot((prev) => {
      if (prev.includes(havayaValue)) {
        return prev.filter((h) => h !== havayaValue);
      }
      
      if (prev.length >= 4) {
        toast({
          title: "הגבלת בחירה",
          description: "ניתן לבחור עד 4 הוויות",
          variant: "destructive",
        });
        return prev;
      }
      
      const newSelection = [...prev, havayaValue];
      onChange(havayaValue);
      return newSelection;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="text-right">
        <h2 className="text-2xl font-bold mb-2">בחר הוויות למשחק</h2>
        <p className="text-gray-600">בחר 3-4 הוויות שילוו אותך במשחק הקרוב</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {havayaOptions.map((havaya) => (
          <motion.div
            key={havaya.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              p-4 rounded-lg border cursor-pointer transition-colors
              ${selectedHavayot.includes(havaya.value)
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-gray-50 border-gray-200'}
            `}
            onClick={() => handleHavayaSelect(havaya.value)}
          >
            <div className="flex items-start justify-between">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${selectedHavayot.includes(havaya.value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100'}
              `}>
                {selectedHavayot.includes(havaya.value) && <Check className="w-4 h-4" />}
              </div>
              <div className="flex-grow text-right mr-4">
                <h3 className="font-semibold">{havaya.value}</h3>
                <p className="text-sm text-gray-600">{havaya.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};