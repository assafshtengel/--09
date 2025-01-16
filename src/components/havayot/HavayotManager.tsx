import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HavayotPopup } from "./HavayotPopup";
import { havayotCategories } from "@/data/havayotCategories";

export const HavayotManager = () => {
  const [openCategory, setOpenCategory] = useState<keyof typeof havayotCategories | null>(null);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Button
        variant="outline"
        className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
        onClick={() => setOpenCategory("professional")}
      >
        מקצועי
        <br />
        טכני/טקטי
      </Button>
      
      <Button
        variant="outline"
        className="h-32 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
        onClick={() => setOpenCategory("mental")}
      >
        מנטלי
        <br />
        גישה וחשיבה
      </Button>
      
      <Button
        variant="outline"
        className="h-32 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100"
        onClick={() => setOpenCategory("emotional")}
      >
        רגשי
        <br />
        אנרגיה ותשוקה
      </Button>
      
      <Button
        variant="outline"
        className="h-32 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
        onClick={() => setOpenCategory("social")}
      >
        חברתי-תקשורתי
        <br />
        אינטראקציה קבוצתית
      </Button>

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