import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HavayotPopup } from "./HavayotPopup";
import { havayotCategories } from "@/data/havayotCategories";

export const HavayotManager = () => {
  const [openCategory, setOpenCategory] = useState<keyof typeof havayotCategories | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 max-w-4xl mx-auto">
      <Button
        variant="outline"
        className="h-24 md:h-32 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all hover:scale-[1.02] shadow-sm text-right"
        onClick={() => setOpenCategory("professional")}
      >
        <div className="flex flex-col items-end w-full gap-1">
          <span className="font-semibold">מקצועי</span>
          <span className="text-sm text-muted-foreground">טכני/טקטי</span>
        </div>
      </Button>
      
      <Button
        variant="outline"
        className="h-24 md:h-32 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all hover:scale-[1.02] shadow-sm text-right"
        onClick={() => setOpenCategory("mental")}
      >
        <div className="flex flex-col items-end w-full gap-1">
          <span className="font-semibold">מנטלי</span>
          <span className="text-sm text-muted-foreground">גישה וחשיבה</span>
        </div>
      </Button>
      
      <Button
        variant="outline"
        className="h-24 md:h-32 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-all hover:scale-[1.02] shadow-sm text-right"
        onClick={() => setOpenCategory("emotional")}
      >
        <div className="flex flex-col items-end w-full gap-1">
          <span className="font-semibold">רגשי</span>
          <span className="text-sm text-muted-foreground">אנרגיה ותשוקה</span>
        </div>
      </Button>
      
      <Button
        variant="outline"
        className="h-24 md:h-32 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all hover:scale-[1.02] shadow-sm text-right"
        onClick={() => setOpenCategory("social")}
      >
        <div className="flex flex-col items-end w-full gap-1">
          <span className="font-semibold">חברתי-תקשורתי</span>
          <span className="text-sm text-muted-foreground">אינטראקציה קבוצתית</span>
        </div>
      </Button>

      {Object.entries(havayotCategories).map(([key, category]) => (
        <HavayotPopup
          key={key}
          isOpen={openCategory === key}
          onClose={() => setOpenCategory(null)}
          category={{
            ...category,
            key: key as "professional" | "mental" | "emotional" | "social"
          }}
        />
      ))}
    </div>
  );
};