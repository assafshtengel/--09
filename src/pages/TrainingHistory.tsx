import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TrainingHistory = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>היסטוריית אימונים</CardTitle>
        </CardHeader>
        <CardContent>
          <p>היסטוריית האימונים תוצג כאן</p>
        </CardContent>
      </Card>
    </div>
  );
};