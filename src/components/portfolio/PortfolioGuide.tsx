import { Button } from "@/components/ui/button";
import { Calendar, Image, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PortfolioGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">איך להזין מידע לתיק השחקן?</h2>
        <p className="text-muted-foreground">עקוב אחר ההנחיות הבאות להוספת מידע לתיק השחקן שלך</p>
      </div>

      <div className="grid gap-4">
        <div className="border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">הישגים</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            לחץ על כפתור "הוסף הישג" בדף ההישגים כדי להוסיף הישגים חדשים
          </p>
          <Button variant="outline" onClick={() => navigate("/achievements")} className="w-full">
            עבור לדף ההישגים
          </Button>
        </div>

        <div className="border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">מדיה</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            העלה תמונות וסרטונים בדף המדיה כדי לתעד את ההתקדמות שלך
          </p>
          <Button variant="outline" onClick={() => navigate("/media")} className="w-full">
            עבור לדף המדיה
          </Button>
        </div>

        <div className="border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">תאריכים חשובים</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            הוסף תאריכים חשובים כמו משחקים ואימונים בדף לוח הזמנים
          </p>
          <Button variant="outline" onClick={() => navigate("/schedule")} className="w-full">
            עבור ללוח הזמנים
          </Button>
        </div>
      </div>
    </div>
  );
};