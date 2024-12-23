import { UserRound, Users, LineChart } from "lucide-react";
import { RoleCard } from "@/components/RoleCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">ברוכים הבאים למערכת הביצועים</h1>
          <p className="text-xl text-muted-foreground">בחר את התפקיד שלך להתחלה</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <RoleCard
            title="שחקנים"
            description="הגדר מטרות אישיות, עקוב אחר הביצועים שלך ושפר את המשחק שלך"
            icon={<UserRound className="w-6 h-6 text-primary" />}
            path="/player"
          />
          
          <RoleCard
            title="מאמנים"
            description="נהל את הקבוצה שלך, הגדר מטרות קבוצתיות ועקוב אחר ההתקדמות"
            icon={<Users className="w-6 h-6 text-primary" />}
            path="/coach"
          />
          
          <RoleCard
            title="אנליסטים"
            description="נתח ביצועים, צור דוחות מפורטים וזהה מגמות חשובות"
            icon={<LineChart className="w-6 h-6 text-primary" />}
            path="/analyst"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;