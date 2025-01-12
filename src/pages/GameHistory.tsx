import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Game {
  id: string;
  date: string;
  opponent: string;
  result: string;
  score: string;
  type: string;
}

const GameHistoryPage = () => {
  const [games] = useState<Game[]>([
    {
      id: "1",
      date: "2024-01-15",
      opponent: "מכבי חיפה",
      result: "ניצחון",
      score: "2-1",
      type: "ליגה",
    },
    {
      id: "2",
      date: "2024-01-08",
      opponent: "הפועל באר שבע",
      result: "הפסד",
      score: "0-2",
      type: "גביע",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.opponent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || game.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">היסטוריית משחקים</h1>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label>חיפוש</Label>
            <Input
              placeholder="חפש לפי יריב..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Label>סוג משחק</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג משחק" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="ליגה">ליגה</SelectItem>
                <SelectItem value="גביע">גביע</SelectItem>
                <SelectItem value="ידידות">ידידות</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline">ייצא לאקסל</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>תאריך</TableHead>
              <TableHead>יריבה</TableHead>
              <TableHead>תוצאה</TableHead>
              <TableHead>תוצאה מספרית</TableHead>
              <TableHead>סוג משחק</TableHead>
              <TableHead>פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGames.map((game) => (
              <TableRow key={game.id}>
                <TableCell>{new Date(game.date).toLocaleDateString("he-IL")}</TableCell>
                <TableCell>{game.opponent}</TableCell>
                <TableCell>{game.result}</TableCell>
                <TableCell>{game.score}</TableCell>
                <TableCell>{game.type}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    צפה בפרטים
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default GameHistoryPage;