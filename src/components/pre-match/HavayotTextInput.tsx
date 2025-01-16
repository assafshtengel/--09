import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HavayotPopup } from "@/components/havayot/HavayotPopup";
import { havayotCategories } from "@/data/havayotCategories";

interface HavayotTextInputProps {
  onSubmit: (havayot: Record<string, string>) => void;
}

export const HavayotTextInput = ({ onSubmit }: HavayotTextInputProps) => {
  const [openCategory, setOpenCategory] = useState<keyof typeof havayotCategories | null>(null);
  const [havayotInputs, setHavayotInputs] = useState<Record<string, string>>({
    professional: "",
    mental: "",
    emotional: "",
    social: "",
  });

  const handleInputChange = (category: string, value: string) => {
    setHavayotInputs(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(havayotInputs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto p-6">
      <div className="text-right space-y-4">
        <h2 className="text-2xl font-bold">תכנן את ההוויות שלך למשחק הקרוב</h2>
        <p className="text-muted-foreground">
          מלא את ההוויות שאיתן תגיע למשחק בתחומים הבאים. תוכל לבחור מתוך רשימת הוויות לדוגמה או לכתוב הוויות משלך. תכנון זה יעזור לך להגיע ממוקד, מחויב ומוכן.
        </p>
      </div>

      {Object.entries(havayotCategories).map(([key, category]) => (
        <div key={key} className="space-y-4 border rounded-lg p-6">
          <div className="flex justify-between items-start gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenCategory(key as keyof typeof havayotCategories)}
              className="shrink-0"
            >
              רשימת הוויות לדוגמה
            </Button>
            <div className="flex-grow space-y-2 text-right">
              <label className="block font-medium">
                תכנן את ההוויות שלך בתחום {category.name}:
              </label>
              <Textarea
                value={havayotInputs[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="min-h-[100px] text-right"
                placeholder="הקלד את ההוויות שלך כאן..."
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="submit" className="w-full">
        שמור את ההוויות שלי
      </Button>

      {Object.entries(havayotCategories).map(([key, category]) => (
        <HavayotPopup
          key={key}
          isOpen={openCategory === key}
          onClose={() => setOpenCategory(null)}
          category={category}
        />
      ))}
    </form>
  );
};