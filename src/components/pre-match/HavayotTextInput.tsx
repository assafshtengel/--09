import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HavayotPopup } from "@/components/havayot/HavayotPopup";
import { havayotCategories } from "@/data/havayotCategories";
import { Save } from "lucide-react";
import { HavayotExplanationDialog } from "./HavayotExplanationDialog";
import { HavayaQuestionDialog } from "./HavayaQuestionDialog";
import { toast } from "sonner";

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
    social: ""
  });

  useEffect(() => {
    console.log("[HavayotTextInput] Component mounted");
    return () => {
      console.log("[HavayotTextInput] Component unmounting");
    };
  }, []);

  const handleExplanationContinue = () => {
    console.log("[HavayotTextInput] Explanation dialog completed");
    setShowExplanation(false);
    setCurrentCategoryIndex(0);
  };

  const handleInputChange = (category: string, value: string) => {
    console.log(`[HavayotTextInput] Saving havaya for category: ${category}`, value);
    
    try {
      const updatedHavayot = {
        ...havayotInputs,
        [category]: value
      };
      
      setHavayotInputs(updatedHavayot);
      setOpenCategory(null);

      if (currentCategoryIndex < categoryKeys.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentCategoryIndex(prev => prev + 1);
          setIsTransitioning(false);
        }, 100);
      } else {
        console.log("[HavayotTextInput] All havayot completed, submitting");
        const havayotArray = Object.values(updatedHavayot).filter(h => h.trim().length > 0);
        console.log('Final havayot:', havayotArray);
        onSubmit(updatedHavayot);
        toast.success("ההוויות נשמרו בהצלחה");
      }
    } catch (error) {
      console.error("[HavayotTextInput] Error saving havaya:", error);
      toast.error("אירעה שגיאה בשמירת ההוויה");
    }
  };

  const categoryKeys = Object.keys(havayotCategories)
    .map(key => key as keyof typeof havayotCategories);

  const handleBack = () => {
    console.log("[HavayotTextInput] Moving back to previous category");
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
  const shouldShowHavayaQuestion = currentCategoryIndex >= 0 && 
                                 !isTransitioning && 
                                 !openCategory && 
                                 !showExplanation;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <HavayotExplanationDialog
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        onContinue={handleExplanationContinue}
      />

      {currentCategory && shouldShowHavayaQuestion && (
        <HavayaQuestionDialog
          isOpen={true}
          onClose={() => {}}
          category={currentCategory}
          value={havayotInputs[currentCategory.key]}
          onSubmit={(value) => handleInputChange(currentCategory.key, value)}
          onShowHavayot={() => setOpenCategory(currentCategory.key)}
          onBack={handleBack}
          isFirstQuestion={currentCategoryIndex === 0}
        />
      )}

      {openCategory && (
        <HavayotPopup
          isOpen={true}
          onClose={() => setOpenCategory(null)}
          category={havayotCategories[openCategory]}
        />
      )}
    </div>
  );
};
