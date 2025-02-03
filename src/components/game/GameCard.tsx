import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Game } from "@/types/game";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface GameCardProps {
  game: Game;
  onSelect: (game: Game, isRecordedGame: boolean) => void;
  onDelete: (e: React.MouseEvent, gameId: string, matchId?: string) => void;
  isDeleting: boolean;
}

export const GameCard = ({ game, onSelect, onDelete, isDeleting }: GameCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGameClick = () => {
    setIsDialogOpen(true);
  };

  const handleGameTypeSelect = (isRecordedGame: boolean) => {
    setIsDialogOpen(false);
    onSelect(game, isRecordedGame);
  };

  return (
    <>
      <Card 
        key={game.id}
        className={cn(
          "cursor-pointer hover:shadow-lg transition-shadow relative",
          game.status === "completed" ? "bg-[#ea384c] text-white" : "bg-white"
        )}
        onClick={handleGameClick}
      >
        <CardHeader>
          <CardTitle className="text-right flex justify-between items-center">
            <span>{format(new Date(game.match_date), "dd/MM/yyyy", { locale: he })}</span>
            {game.status === "completed" && (
              <span className="text-sm">הושלם</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-red-500 hover:text-white",
                game.status === "completed" ? "text-white" : "text-red-500"
              )}
              onClick={(e) => onDelete(e, game.id, game.match_id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <p>נגד: {game.opponent}</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">בחר סוג צפייה</DialogTitle>
            <DialogDescription className="text-right">
              האם אתה צופה בשידור מוקלט של המשחק או רק ממלא דוח סיכום משחק ללא הקלטת המשחק?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button 
              onClick={() => handleGameTypeSelect(true)}
              className="w-full"
            >
              צופה בשידור מוקלט
            </Button>
            <Button 
              onClick={() => handleGameTypeSelect(false)}
              variant="outline"
              className="w-full"
            >
              ממלא דוח סיכום בלבד
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};