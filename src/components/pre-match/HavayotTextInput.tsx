import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { havayotCategories, CategoryKeyType } from "@/data/havayotCategories";
import { HavayotPopup } from "@/components/havayot/HavayotPopup";

interface HavayotTextInputProps {
  onSubmit: (havayot: Record<string, string>) => void;
}

export const HavayotTextInput = ({ onSubmit }: HavayotTextInputProps) => {
  const [currentCategory, setCurrentCategory] = useState<CategoryKeyType>("professional");
  const [havayot, setHavayot] = useState<Record<string, string>>({
    professional: "",
    mental: "",
    emotional: "",
    social: "",
  });
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (havayot[currentCategory].trim()) {
      if (currentCategory === "social") {
        onSubmit(havayot);
      } else {
        // Move to next category
        const categories: CategoryKeyType[] = ["professional", "mental", "emotional", "social"];
        const currentIndex = categories.indexOf(currentCategory);
        setCurrentCategory(categories[currentIndex + 1]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && havayot[currentCategory].trim()) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const currentCategoryData = havayotCategories[currentCategory];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">
          {currentCategory === "professional" && "כיצד אתה רוצה להיראות ועל מה לשים דגש מבחינה מקצועית במשחק?"}
          {currentCategory === "mental" && "כיצד אתה רוצה להיראות ועל מה לשים דגש מבחינה מנטלית במשחק?"}
          {currentCategory === "emotional" && "כיצד אתה רוצה להיראות ועל מה לשים דגש מבחינה רגשית במשחק?"}
          {currentCategory === "social" && "כיצד אתה רוצה להיראות ועל מה לשים דגש מבחינה חברתית-תקשורתית במשחק?"}
        </h2>
        <p className="text-gray-600">
          המחקר מוכיח שכאשר שחקן כותב את המטרות והדגשים שלו בעצמו, המחויבות שלו לביצוע עולה משמעותית. הכתיבה האישית מחזקת את המוטיבציה והחיבור הרגשי למטרות.
        </p>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-lg space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-blue-500 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center text-sm mt-0.5">
            ℹ️
          </div>
          <div className="text-sm text-blue-800">
            <p>מוזמן לראות דוגמאות להוויות {currentCategoryData.name} בלחיצה על הכפתור.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            value={havayot[currentCategory]}
            onChange={(e) => setHavayot({ ...havayot, [currentCategory]: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder={`רשום את ההוויה שאיתה אתה מגיע למשחק בתחום ה${currentCategoryData.name}`}
            className="h-14 text-right"
          />
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowExamples(true)}
          >
            צפה בהוויות לדוגמה
          </Button>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!havayot[currentCategory].trim()}
        >
          {currentCategory === "social" ? "סיים" : "המשך"}
          <ChevronLeft className="mr-2 h-4 w-4" />
        </Button>
      </form>

      <HavayotPopup
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
        category={currentCategoryData}
      />
    </div>
  );
};