import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HavayotPopup } from "@/components/havayot/HavayotPopup";
import { havayotCategories } from "@/data/havayotCategories";
import { BookOpen, Save, Settings, Brain, Heart, Users } from "lucide-react";

interface HavayotTextInputProps {
  onSubmit: (havayot: Record<string, string>) => void;
}

const categoryIcons = {
  professional: Settings,
  mental: Brain,
  emotional: Heart,
  social: Users,
};

const categoryColors = {
  professional: "from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100",
  mental: "from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100",
  emotional: "from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100",
  social: "from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100",
};

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
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto p-4 md:p-6 font-heebo">
      <div className="text-center space-y-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          תכנן את ההוויות שלך למשחק הקרוב
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base">
          מלא את ההוויות שאיתן תגיע למשחק בתחומים הבאים. תוכל לבחור מתוך רשימת הוויות לדוגמה או לכתוב הוויות משלך. תכנון זה יעזור לך להגיע ממוקד, מחויב ומוכן.
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(havayotCategories).map(([key, category]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          const gradientColor = categoryColors[key as keyof typeof categoryColors];
          
          return (
            <div 
              key={key} 
              className={`rounded-lg p-6 bg-gradient-to-r ${gradientColor} transition-all duration-300 shadow-sm hover:shadow-md`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow space-y-4 text-right order-2 md:order-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="h-5 w-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                  <Textarea
                    value={havayotInputs[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="min-h-[120px] w-full text-right resize-none bg-white/80 hover:bg-white focus:bg-white transition-colors border-gray-200 focus:border-primary"
                    placeholder="הקלד את ההוויות שלך כאן..."
                  />
                </div>
                <div className="order-1 md:order-2 w-full md:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenCategory(key as keyof typeof havayotCategories)}
                    className="w-full md:w-auto h-auto py-3 px-4 bg-white hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                  >
                    <BookOpen className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                    רשימת הוויות לדוגמה
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button 
        type="submit" 
        className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg"
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