import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const AdminSection = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="bg-gradient-to-br from-purple-600 to-purple-700 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg" 
        onClick={() => navigate("/admin/dashboard")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-6 w-6 text-white" />
            דף ניהול
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm opacity-90">גישה לניהול המערכת</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};