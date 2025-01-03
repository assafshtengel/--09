import { RoleCard } from "@/components/RoleCard";
import { Trophy, Activity, ChartBar } from "lucide-react";

export default function Index() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-right">ברוכים הבאים</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RoleCard
          title="משחקים"
          description="צפייה וניהול משחקים, מעקב אחר ביצועים ותוצאות"
          icon={<Trophy className="w-6 h-6" />}
          path="/game-selection"
        />
        <RoleCard
          title="אימונים"
          description="תיעוד ומעקב אחר אימונים, התקדמות והערות"
          icon={<Activity className="w-6 h-6" />}
          path="/training"
        />
        <RoleCard
          title="סטטיסטיקות"
          description="ניתוח נתונים, מדדי ביצוע והשוואות"
          icon={<ChartBar className="w-6 h-6" />}
          path="/stats"
        />
      </div>
    </div>
  );
}