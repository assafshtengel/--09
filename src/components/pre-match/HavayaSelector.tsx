import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HavayaSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext?: () => void;
  onBack?: () => void;
}

interface HavayaOption {
  name: string;
  explanation: string;
}

export const HavayaSelector = ({ value, onChange, onNext, onBack }: HavayaSelectorProps) => {
  const [options] = useState<HavayaOption[]>([
    { name: "מוטיבציה", explanation: "דחף פנימי להשיג מטרות ולהצליח" },
    { name: "ביטחון", explanation: "אמונה ביכולות האישיות שלך" },
    { name: "שליטה", explanation: "יכולת לנהל מצבים ורגשות" },
    { name: "ריכוז", explanation: "מיקוד מלא במשימה הנוכחית" },
    { name: "רוגע", explanation: "שלווה נפשית ושקט פנימי" },
    { name: "הנאה", explanation: "תחושת סיפוק וכיף במשחק" },
    { name: "נחישות", explanation: "התמדה להשגת המטרה בכל מחיר" },
    { name: "אנרגטיות", explanation: "מרץ ותחושת חיוניות גבוהה" },
    { name: "חדות", explanation: "ערנות מנטלית וקבלת החלטות מהירה" },
    { name: "אגרסיביות", explanation: "נחישות ודומיננטיות במשחק" },
    { name: "אופטימיות", explanation: "גישה חיובית ואמונה בטוב" },
    { name: "תקשורת", explanation: "יכולת לתקשר ולשתף פעולה" },
    { name: "יצירתיות", explanation: "חשיבה מחוץ לקופסה ופתרונות חדשים" },
    { name: "אחריות", explanation: "לקיחת אחריות על מעשים והחלטות" },
    { name: "מנהיגות", explanation: "יכולת להוביל ולהשפיע על אחרים" },
    { name: "התמדה", explanation: "המשך מאמץ גם כשקשה" },
    { name: "גמישות", explanation: "יכולת להסתגל למצבים משתנים" },
    { name: "סבלנות", explanation: "יכולת להתמיד ולחכות לרגע הנכון" },
    { name: "אומץ", explanation: "נכונות להתמודד עם אתגרים ופחדים" },
    { name: "משמעת", explanation: "יכולת לפעול לפי כללים ומסגרת" },
    { name: "שיתוף פעולה", explanation: "עבודת צוות ותמיכה הדדית" }
  ]);

  const handleOptionToggle = (option: HavayaOption) => {
    if (value.includes(option.name)) {
      onChange(value.filter((v) => v !== option.name));
    } else {
      onChange([...value, option.name]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-right">בחר הוויות למשחק</h2>
        <p className="text-gray-600 text-right">בחר 3-4 הוויות שתרצה להתמקד בהן במשחק הקרוב</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <button
              key={option.name}
              onClick={() => handleOptionToggle(option)}
              className={`p-4 border rounded-lg text-right ${
                value.includes(option.name) 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{option.name}</span>
                <span className="text-sm opacity-80">{option.explanation}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={onNext}
          disabled={value.length < 3}
        >
          המשך
        </Button>
      </div>
    </div>
  );
};