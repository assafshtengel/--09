import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { 
  ClipboardList, 
  Trophy, 
  Calendar, 
  Activity,
  BookOpen
} from "lucide-react";

const Player = () => {
  return (
    <div className="container mx-auto p-4">
      <Navigation />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <Link to="/pre-match-report">
          <Card className="p-6 hover:bg-accent transition-colors">
            <div className="flex items-center space-x-4 space-x-reverse">
              <ClipboardList className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">דוח טרום משחק</h3>
                <p className="text-sm text-muted-foreground">הכן את עצמך למשחק הבא</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/game">
          <Card className="p-6 hover:bg-accent transition-colors">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">מעקב משחק</h3>
                <p className="text-sm text-muted-foreground">תעד את הביצועים שלך במשחק</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/training-summary">
          <Card className="p-6 hover:bg-accent transition-colors">
            <div className="flex items-center space-x-4 space-x-reverse">
              <BookOpen className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">סיכום אימון</h3>
                <p className="text-sm text-muted-foreground">תעד ושתף את התקדמותך באימונים</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/achievements">
          <Card className="p-6 hover:bg-accent transition-colors">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Trophy className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">הישגים</h3>
                <p className="text-sm text-muted-foreground">עקוב אחר ההישגים שלך</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/schedule">
          <Card className="p-6 hover:bg-accent transition-colors">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">מערכת שבועית</h3>
                <p className="text-sm text-muted-foreground">נהל את לוח הזמנים שלך</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Player;