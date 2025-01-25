import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const HavayotIntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center text-primary">
          חשיבות ההוויות למשחק שלך
        </h1>
        
        <div className="space-y-6 text-right">
          <p className="text-lg leading-relaxed text-gray-700">
            הוויות הן הבסיס להכנה מנטלית ומקצועית מוצלחת. מחקרים מראים שכתיבת ההוויות מעלה את המחויבות והמוטיבציה, ומשפרת את הביצועים שלך על המגרש.
          </p>
        </div>

        <div className="flex justify-center pt-6">
          <Button
            onClick={() => navigate("/pre-match-report")}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto flex items-center gap-2"
          >
            הבנתי, בוא נתחיל
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};