import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { AdditionalActions } from "./AdditionalActions";
import { GameNotes } from "./GameNotes";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GamePreviewProps {
  actions: Action[];
  onActionAdd: (action: Action) => void;
  onStartMatch: () => void;
}

export const GamePreview = ({ actions, onActionAdd, onStartMatch }: GamePreviewProps) => {
  const { id: matchId } = useParams<{ id: string }>();
  const [havaya, setHavaya] = useState<string[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [generalNote, setGeneralNote] = useState<string>("");

  useEffect(() => {
    const loadHavaya = async () => {
      if (!matchId) return;

      try {
        const { data: match, error } = await supabase
          .from('matches')
          .select(`
            pre_match_reports (
              havaya
            )
          `)
          .eq('id', matchId)
          .single();

        if (error) throw error;

        if (match?.pre_match_reports?.havaya) {
          setHavaya(match.pre_match_reports.havaya.split(','));
        }
      } catch (error) {
        console.error('Error loading havaya:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את ההוויות",
          variant: "destructive",
        });
      }
    };

    const loadInsights = async () => {
      if (!matchId) return;
      
      setIsLoadingInsights(true);
      try {
        const response = await supabase.functions.invoke('generate-pre-match-insights', {
          body: { matchId },
        });

        if (response.error) throw response.error;
        setInsights(response.data.insights);
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

    loadHavaya();
    loadInsights();
  }, [matchId]);

  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('goals-preview');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = 'game-goals.png';
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "צילום מסך הושלם",
          description: "התמונה נשמרה בהצלחה",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לצלם את המסך",
        variant: "destructive",
      });
    }
  };

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
      {havaya.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-right mb-4">הוויות נבחרות</h2>
          <div className="flex flex-wrap gap-3 justify-end">
            {havaya.map((h, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-lg py-2 px-4"
              >
                {h}
              </Badge>
            ))}
          </div>
        </div>
      )}

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
          <div className="text-right whitespace-pre-line">
            {insights}
          </div>
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

      <div className="flex gap-3 justify-end">
        <Button onClick={takeScreenshot} variant="outline" size="sm">
          צלם מסך
        </Button>
        <Button onClick={onStartMatch} size="sm">
          המשך
        </Button>
      </div>
    </div>
  );
};