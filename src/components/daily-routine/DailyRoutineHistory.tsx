import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export const DailyRoutineHistory = () => {
  const { data: routines, isLoading } = useQuery({
    queryKey: ["daily-routines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_routines")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-4">
      {routines?.map((routine) => (
        <Card key={routine.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {format(new Date(routine.date), "dd/MM/yyyy")}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="font-medium">שעות שינה:</span>{" "}
                  {routine.sleep_hours}
                </div>
                <div>
                  <span className="font-medium">כוסות מים:</span>{" "}
                  {routine.water_intake || "לא צוין"}
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">ארוחה</TableHead>
                    <TableHead className="text-right">פירוט</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">ארוחת בוקר</TableCell>
                    <TableCell>{routine.breakfast || "לא צוין"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ארוחת צהריים</TableCell>
                    <TableCell>{routine.lunch || "לא צוין"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ארוחת ערב</TableCell>
                    <TableCell>{routine.dinner || "לא צוין"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">חטיפים</TableCell>
                    <TableCell>{routine.snacks || "לא צוין"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {routine.notes && (
                <div className="mt-4">
                  <span className="font-medium">הערות:</span> {routine.notes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};