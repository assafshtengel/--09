import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Note {
  text: string;
  minute: number;
}

interface NotesSectionProps {
  notes: Note[];
}

export const NotesSection = ({ notes }: NotesSectionProps) => {
  if (notes.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-right">הערות כלליות</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">דקה</TableHead>
            <TableHead className="text-right">הערה</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note, index) => (
            <TableRow key={index}>
              <TableCell>{note.minute}'</TableCell>
              <TableCell className="text-right">{note.text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};