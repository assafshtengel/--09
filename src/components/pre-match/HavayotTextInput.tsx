import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HavayotPopup } from "@/components/havayot/HavayotPopup";
import { havayotCategories } from "@/data/havayotCategories";
import { BookOpen, Save } from "lucide-react";

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
      <div className="text-center space-y-4 bg-gray-50/50 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-primary">
          תכנן את ההוויות שלך למשחק הקרוב
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          מלא את ההוויות שאיתן תגיע למשחק בתחומים הבאים. תוכל לבחור מתוך רשימת הוויות לדוגמה או לכתוב הוויות משלך. תכנון זה יעזור לך להגיע ממוקד, מחויב ומוכן.
        </p>
      </div>

      {Object.entries(havayotCategories).map(([key, category]) => (
        <div 
          key={key} 
          className="space-y-4 border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-grow space-y-2 text-right order-2 md:order-1 w-full md:w-auto">
              <label className="block font-medium text-lg text-gray-800">
                {category.name}:
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                {category.description}
              </p>
              <Textarea
                value={havayotInputs[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="min-h-[120px] text-right resize-none bg-gray-50/50 hover:bg-white focus:bg-white transition-colors"
                placeholder="הקלד את ההוויות שלך כאן..."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenCategory(key as keyof typeof havayotCategories)}
              className="order-1 md:order-2 w-full md:w-auto h-auto py-2 px-4 bg-white hover:bg-gray-50"
            >
              <BookOpen className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
              רשימת הוויות לדוגמה
            </Button>
          </div>
        </div>
      ))}

      <Button 
        type="submit" 
        className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-6 text-lg"
      >
        <Save className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
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