import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GameNotesProps {
  generalNote: string;
  onNoteChange: (note: string) => void;
  onAddNote: () => void;
}

export const GameNotes = ({ generalNote, onNoteChange, onAddNote }: GameNotesProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Button onClick={onAddNote} size="sm">
        הוסף הערה
      </Button>
      <Input
        value={generalNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="הערה כללית..."
        className="text-right text-sm"
      />
    </div>
  );
};