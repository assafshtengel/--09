import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HavayotPopup } from "@/components/havayot/HavayotPopup";
import { havayotCategories } from "@/data/havayotCategories";
import { Save } from "lucide-react";
import { HavayotExplanationDialog } from "./HavayotExplanationDialog";
import { HavayaQuestionDialog } from "./HavayaQuestionDialog";

interface HavayotTextInputProps {
  onSubmit: (havayot: Record<string, string>) => void;
}

export const HavayotTextInput = ({ onSubmit }: HavayotTextInputProps) => {
  const [showExplanation, setShowExplanation] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(-1);
  const [openCategory, setOpenCategory] = useState<keyof typeof havayotCategories | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [havayotInputs, setHavayotInputs] = useState<Record<string, string>>({
    professional: "",
    mental: "",
    emotional: "",
    social: "",
  });

  const categoryKeys = Object.keys(havayotCategories) as Array<keyof typeof havayotCategories>;

  const handleExplanationContinue = () => {
    setShowExplanation(false);
    setCurrentCategoryIndex(0);
  };

  const handleInputChange = (category: string, value: string) => {
    setHavayotInputs(prev => ({
      ...prev,
      [category]: value
    }));

    if (currentCategoryIndex < categoryKeys.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentCategoryIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 100);
    } else {
      onSubmit(havayotInputs);
    }
  };

  const handleBack = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const getCurrentCategory = () => {
    if (currentCategoryIndex < 0 || currentCategoryIndex >= categoryKeys.length) return null;
    const currentKey = categoryKeys[currentCategoryIndex];
    return {
      key: currentKey,
      ...havayotCategories[currentKey]
    };
  };

  const currentCategory = getCurrentCategory();

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <HavayotExplanationDialog
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        onContinue={handleExplanationContinue}
      />

      {currentCategory && (
        <HavayaQuestionDialog
          isOpen={currentCategoryIndex >= 0 && !isTransitioning}
          onClose={() => {}}
          category={currentCategory}
          value=""
          onSubmit={(value) => handleInputChange(currentCategory.key, value)}
          onShowHavayot={() => setOpenCategory(currentCategory.key)}
          onBack={handleBack}
          isFirstQuestion={currentCategoryIndex === 0}
        />
      )}

      {Object.entries(havayotCategories).map(([key, category]) => (
        <HavayotPopup
          key={key}
          isOpen={openCategory === key}
          onClose={() => setOpenCategory(null)}
          category={category}
        />
      ))}
    </div>
  );
};