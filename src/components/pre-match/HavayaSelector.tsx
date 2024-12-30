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
import { Info, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface HavayaSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const havayaOptions = [
  { value: "נחוש", description: "לא לוותר גם כשתנאים קשים, תמיד להמשיך ולהאמין במטרה" },
  { value: "רגוע", description: "לשמור על שלווה פנימית ועל קור רוח, גם ברגעים לחוצים" },
  { value: "אסיר תודה", description: "להעריך את ההזדמנות לשחק, את הקבוצה, את המאמנים – וכל מה שיש" },
  { value: "ממוקד", description: "להשאיר בצד הסחות דעת ולהתרכז רק בפעולות ובהחלטות הנדרשות ברגע" },
  { value: "בוטח", description: "להאמין ביכולותיך ולפעול בהחלטיות ללא ספקות מיותרים" },
  { value: "אמיץ", description: "להעז, לנסות מהלכים חדשים ולא לחשוש מהפסד או טעות" },
  { value: "חברותי", description: "לשתף פעולה, לתת כתף ולהעצים את החברים בקבוצה" },
  { value: "גמיש", description: "לדעת להתאים את עצמך במהירות לשינויים או מצבים בלתי צפויים במשחק" },
  { value: "עוצמתי", description: "לחוש ביטחון פנימי, כוח והתלהבות שמניעים אותך קדימה" },
  { value: "אנרגטי", description: "להגיע לתחרות עם מלא מרץ, חיוניות ותשוקה למשחק" },
  { value: "יצירתי", description: "לחשוב מחוץ לקופסה, להפתיע את היריב ולייצר פתרונות מקוריים במגרש" },
  { value: "נוכח", description: "להיות 'כאן ועכשיו', בלי לתת לעבר או לעתיד להסיח את דעתך" },
  { value: "אופטימי", description: "לראות בכל מצב הזדמנות ולהאמין בתוצאה חיובית" },
  { value: "מדויק", description: "לשים לב לפרטים קטנים, לדייק במסירה, בבעיטה ובכל פעולה שלך" },
  { value: "סבלני", description: "לדעת לחכות למהלך הנכון ולעיתוי המתאים בלי להיחפז" },
  { value: "מחוייב", description: "לתת 100% מעצמך לכל פעולה ולשאוף לעמוד ביעדים שהצבת" },
  { value: "מפרגן", description: "לשבח ולהעריך את התרומה של חברי הקבוצה ושל הצוות המקצועי" },
  { value: "הוגן", description: "לשחק ביושר, לכבד את החוקים ולגלות רוח ספורטיבית" },
  { value: "לומד", description: "לנצל כל מצב כהזדמנות ללמידה, לצמוח מהצלחות וגם מטעויות" },
  { value: "מהנה", description: "לזכור ליהנות מהמשחק ולשחק עם חיוך, גם ברגעים תחרותיים" },
  { value: "עקבי", description: "לשמור על רמה גבוהה של ביצועים וגישת משחק יציבה לאורך כל זמן המשחק" },
];

export const HavayaSelector = ({ value, onChange }: HavayaSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter(v => v !== selectedValue));
    } else if (value.length < 4) {
      onChange([...value, selectedValue]);
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-secondary/10 p-6 rounded-lg space-y-4 text-right">
        <h2 className="text-xl font-bold text-secondary">הכנה מנטלית למשחק</h2>
        <p className="text-gray-700">
          שחקני העל מחליטים מראש איך הם יגיעו לכל משחק, וכך מבטיחים שהאנרגיה והאופי שלהם לא ישתנו לפי מה שקורה במשחק – אלא הם אלו שיוצרים את מהלך המשחק. זו הכנה מנטלית מנצחת.
        </p>
        <p className="text-gray-700">
          עכשיו, מתוך רשימת ההוויות הבאה, בחר 3–4 הוויות שאתה רוצה לאמץ במשחק הקרוב.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">הוויות למשחק</h3>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-96 text-right p-4">
              <p className="text-sm text-gray-600">
                ברגע שאתה "מכריז" על ההוויות האלה מראש, אתה מכתיב לעצמך את מצב הרוח, הגישה והאופי שלך על המגרש – במקום לתת לאירועי המשחק להשפיע עליך. זו הכנה מנטלית אמיתית שמובילה לתוצאות מנצחות!
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="flex flex-wrap gap-2">
          {value.map((selected) => (
            <Badge 
              key={selected}
              variant="secondary"
              className="text-sm py-1 px-3"
              onClick={() => handleSelect(selected)}
            >
              {selected}
              <button 
                className="mr-1 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter(v => v !== selected));
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>

        <div className="border rounded-lg divide-y">
          {havayaOptions.map((option) => (
            <button
              key={option.value}
              className={`w-full text-right p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 ${
                value.includes(option.value) ? 'bg-primary/5' : ''
              }`}
              onClick={() => handleSelect(option.value)}
              disabled={value.length >= 4 && !value.includes(option.value)}
            >
              <div className="flex-1">
                <div className="font-medium">{option.value}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              {value.includes(option.value) && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};