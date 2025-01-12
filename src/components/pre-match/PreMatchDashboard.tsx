import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Plus, History } from "lucide-react";

interface PreMatchDashboardProps {
  onCreateNew: () => void;
}

export const PreMatchDashboard = ({ onCreateNew }: PreMatchDashboardProps) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold">יעדים למשחק</h1>
        <p className="text-muted-foreground">
          הגדר את היעדים שלך למשחק הבא ועקוב אחר ההתקדמות שלך
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">דוח חדש</h2>
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <p className="text-muted-foreground">
            צור דוח יעדים חדש למשחק הבא שלך
          </p>
          <Button onClick={onCreateNew} className="w-full">
            התחל דוח חדש
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">היסטוריה</h2>
            <History className="h-5 w-5 text-primary" />
          </div>
          <p className="text-muted-foreground">
            צפה בדוחות קודמים ועקוב אחר ההתקדמות שלך
          </p>
          <Button variant="outline" className="w-full">
            צפה בהיסטוריה
          </Button>
        </Card>
      </div>
    </div>
  );
};