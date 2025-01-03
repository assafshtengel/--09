import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const MatchHistory = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>היסטוריית משחקים</CardTitle>
        </CardHeader>
        <CardContent>
          <p>היסטוריית המשחקים תוצג כאן</p>
        </CardContent>
      </Card>
    </div>
  );
};