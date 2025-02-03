import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  onDelete: (e: React.MouseEvent, gameId: string, matchId?: string) => void;
  isDeleting: boolean;
}

export const GameCard = ({ game, onSelect, onDelete, isDeleting }: GameCardProps) => {
  return (
    <Card 
      key={game.id}
      className={cn(
        "cursor-pointer hover:shadow-lg transition-shadow relative",
        game.status === "completed" ? "bg-[#ea384c] text-white" : "bg-white"
      )}
      onClick={() => onSelect(game)}
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
  );
};