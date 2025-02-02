import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, History, Dumbbell, Calendar, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const quickActions = [
  {
    title: 'דוח טרום משחק',
    description: 'הכנה למשחק הבא',
    path: '/pre-match-report',
    icon: <FileText className="h-5 w-5" />,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'מעקב משחק',
    description: 'תיעוד ומעקב אחר משחקים',
    path: '/game-selection',
    icon: <List className="h-5 w-5" />,
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    title: 'היסטוריית משחקים',
    description: 'צפייה בהיסטוריית משחקים',
    path: '/game-history',
    icon: <History className="h-5 w-5" />,
    gradient: 'from-green-500 to-green-600',
  },
  {
    title: 'סיכום אימון',
    description: 'סיכום והערכת אימונים',
    path: '/training-summary',
    icon: <Dumbbell className="h-5 w-5" />,
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    title: 'תכנון רוטינות וסדר יום',
    description: 'תכנון 48 שעות לפני משחק',
    path: 'https://did.li/48-hours-before-game',
    icon: <Calendar className="h-5 w-5" />,
    gradient: 'from-orange-500 to-orange-600',
    isExternal: true,
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  const handleClick = (path: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  return (
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
            onClick={() => handleClick(action.path, action.isExternal)}
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
  );
};