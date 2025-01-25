import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileText, PlayCircle, History } from "lucide-react";

export const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "דוח טרום משחק",
      description: "הכנת דוח לפני המשחק",
      icon: <FileText className="h-6 w-6" />,
      gradient: "from-indigo-500 to-indigo-600",
      path: "/pre-match-intro",
    },
    {
      title: "היסטוריית משחקים",
      description: "צפייה במשחקים קודמים",
      icon: <History className="h-6 w-6" />,
      gradient: "from-orange-500 to-orange-600",
      path: "/match-history",
    },
    {
      title: "תכנון משחק",
      description: "הכנה למשחק הבא",
      icon: <PlayCircle className="h-6 w-6" />,
      gradient: "from-blue-500 to-blue-600",
      path: "/pre-game-planner",
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center py-8 border-b"
      >
        <h1 className="text-4xl font-bold mb-3">ברוך הבא</h1>
        <p className="text-muted-foreground text-lg">בחר באפשרות כדי להתחיל</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br ${action.gradient} text-white`}
              onClick={() => navigate(action.path)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {action.icon}
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-90">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};