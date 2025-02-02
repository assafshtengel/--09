import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { AdditionalActions } from "./AdditionalActions";
import { GameNotes } from "./GameNotes";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GamePreviewProps {
  actions: Action[];
  onActionAdd: (action: Action) => void;
  onStartMatch: () => void;
  matchId: string;
}

export const GamePreview = ({ actions, onActionAdd, onStartMatch, matchId }: GamePreviewProps) => {
  const [insights, setInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [generalNote, setGeneralNote] = useState<string>("");

  useEffect(() => {
    const loadInsights = async () => {
      if (!matchId) return;
      
      setIsLoadingInsights(true);
      try {
        const response = await supabase.functions.invoke('generate-pre-match-insights', {
          body: { matchId },
        });

        if (response.error) throw response.error;
        setInsights(response.data?.insights || "");
      } catch (error) {
        console.error('Error loading insights:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את התובנות",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadInsights();
  }, [matchId]);

  const handleAddNote = async () => {
    if (!matchId || !generalNote.trim()) return;

    try {
      const { error } = await supabase
        .from('match_notes')
        .insert([
          { match_id: matchId, minute: 0, note: generalNote }
        ]);

      if (error) throw error;

      toast({
        title: "ההערה נשמרה בהצלחה",
      });
      setGeneralNote("");
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערה",
        variant: "destructive",
      });
    }
  };

  return (
    <div id="goals-preview" className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-right mb-4">יעדי המשחק</h2>
        <div className="grid gap-3">
          {actions.map(action => (
            <div key={action.id} className="border p-3 rounded-lg text-right hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold">{action.name}</h3>
              {action.goal && (
                <p className="text-sm text-gray-600 mt-1">יעד: {action.goal}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {insights && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-right mb-4">רגע לפני...</h2>
          <ScrollArea className="h-[200px] w-full">
            <div className="text-right space-y-4 px-4">
              {typeof insights === 'string' && insights.split('\n\n').map((insight, index) => (
                <p key={index} className="text-lg leading-relaxed">
                  {insight}
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoadingInsights && (
        <div className="text-center text-gray-500">
          מכין תובנות אישיות...
        </div>
      )}

      <AdditionalActions onActionSelect={onActionAdd} selectedActions={actions} />
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-right mb-4">רגע לפני המשחק מעוניין לרשום לעצמך עוד משהו? זה המקום להוציא כל מה שיש לך</h2>
        <GameNotes
          generalNote={generalNote}
          onNoteChange={setGeneralNote}
          onAddNote={handleAddNote}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onStartMatch} size="sm">
          המשך
        </Button>
      </div>
    </div>
  );
};