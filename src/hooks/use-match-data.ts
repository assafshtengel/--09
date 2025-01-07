import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Match, ActionLog, GamePhase } from "@/types/game";
import { Action } from "@/components/ActionSelector";

export const useMatchData = (matchId: string | undefined) => {
  const { toast } = useToast();
  const [matchDetails, setMatchDetails] = useState<Match>({
    id: "",
    player_id: "",
    created_at: "",
    match_date: "",
    opponent: null,
    location: null,
    status: "preview",
    pre_match_report_id: null,
    match_type: null,
    final_score: null,
    player_position: null,
    team: null,
    team_name: null,
    player_role: null,
  });
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<Array<{ playerIn: string | null; playerOut: string | null; minute: number }>>([]);

  const loadMatchData = async () => {
    if (!matchId) return;

    try {
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          pre_match_reports (
            *
          )
        `)
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      const typedMatch = match as unknown as Match;
      setMatchDetails(typedMatch);

      if (match?.pre_match_reports?.actions) {
        const rawActions = match.pre_match_reports.actions as unknown as Array<{
          id: string;
          name: string;
          goal?: string;
          isSelected: boolean;
        }>;
        
        const validActions = rawActions
          .filter(action => 
            typeof action === 'object' && 
            action !== null && 
            'id' in action && 
            'name' in action && 
            'isSelected' in action
          )
          .map(action => ({
            id: action.id,
            name: action.name,
            goal: action.goal,
            isSelected: action.isSelected
          }));
          
        console.log("Parsed actions:", validActions);
        setActions(validActions);
      }

      // Load existing logs
      const { data: existingLogs, error: logsError } = await supabase
        .from('match_actions')
        .select('*')
        .eq('match_id', matchId);

      if (logsError) throw logsError;

      if (existingLogs) {
        setActionLogs(existingLogs.map(log => ({
          actionId: log.action_id,
          minute: log.minute,
          result: log.result as "success" | "failure",
          note: log.note
        })));
      }

      // Load existing notes
      const { data: existingNotes, error: notesError } = await supabase
        .from('match_notes')
        .select('*')
        .eq('match_id', matchId);

      if (notesError) throw notesError;

      if (existingNotes) {
        setGeneralNotes(existingNotes.map(note => ({
          text: note.note,
          minute: note.minute
        })));
      }

      // Load existing substitutions
      const { data: existingSubs, error: subsError } = await supabase
        .from('match_substitutions')
        .select('*')
        .eq('match_id', matchId);

      if (subsError) throw subsError;

      if (existingSubs) {
        setSubstitutions(existingSubs.map(sub => ({
          playerIn: sub.player_in,
          playerOut: sub.player_out,
          minute: sub.minute
        })));
      }
    } catch (error) {
      console.error("Error loading match data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשחק",
        variant: "destructive",
      });
    }
  };

  return {
    matchDetails,
    actionLogs,
    actions,
    generalNotes,
    substitutions,
    loadMatchData,
    setMatchDetails,
    setActionLogs,
    setActions,
    setGeneralNotes,
    setSubstitutions,
  };
};