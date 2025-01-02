import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div data-section="general-notes" className="space-y-2">
      <h3 className="text-lg md:text-xl font-semibold text-right">הערות כלליות</h3>
      <ScrollArea className="h-[200px] w-full rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right whitespace-nowrap px-2 md:px-4">דקה</TableHead>
              <TableHead className="text-right px-2 md:px-4">הערה</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note, index) => (
              <TableRow key={index}>
                <TableCell className="px-2 md:px-4">{note.minute}'</TableCell>
                <TableCell className="text-right px-2 md:px-4 text-sm md:text-base">
                  {note.text}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};