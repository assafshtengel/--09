import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, FileChartLine, Activity, Sun } from "lucide-react";

export const PreMatchDashboard = () => {
  const navigate = useNavigate();

  const buttons = [
    {
      id: "pre-match-report",
      label: "דוח טרום משחק",
      icon: <FileText className="ml-2" />,
      onClick: () => navigate("/player/pre-match-report")
    },
    {
      id: "match-summary",
      label: "סיכום משחק",
      icon: <FileChartLine className="ml-2" />,
      onClick: () => navigate("/player/match-summary")
    },
    {
      id: "training-summaries",
      label: "סיכומי אימונים",
      icon: <Activity className="ml-2" />,
      onClick: () => navigate("/player/training-summaries")
    },
    {
      id: "daily-routine",
      label: "תזונה/שינה ושגרה יומית",
      icon: <Sun className="ml-2" />,
      onClick: () => navigate("/player/daily-routine")
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-right">הכנה למשחק</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buttons.map((button) => (
          <Button
            key={button.id}
            onClick={button.onClick}
            className="h-24 text-lg justify-center items-center flex flex-row-reverse"
            variant="outline"
          >
            {button.icon}
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
};