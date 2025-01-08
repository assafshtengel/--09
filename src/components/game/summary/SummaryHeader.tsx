import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SummaryHeaderProps {
  matchId?: string;
  opponent: string | null;
  gamePhase: "halftime" | "ended";
}

export const SummaryHeader = ({ matchId, opponent, gamePhase }: SummaryHeaderProps) => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, profile_picture_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfilePicture(profile.profile_picture_url);
        setPlayerName(profile.full_name);
      }
    };

    fetchPlayerProfile();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-primary">
          {profilePicture ? (
            <AvatarImage src={profilePicture} alt={playerName || "Player"} />
          ) : (
            <AvatarFallback>
              {playerName?.split(' ').map(n => n[0]).join('') || 'P'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="text-right">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            סיכום משחק - המסע שלך להצלחה!
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'dd/MM/yyyy')}
            {opponent && ` | נגד ${opponent}`}
          </p>
          {playerName && (
            <p className="text-lg font-semibold text-primary">{playerName}</p>
          )}
        </div>
      </div>
    </div>
  );
};