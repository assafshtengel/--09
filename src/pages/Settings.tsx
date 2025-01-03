import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Settings = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>הגדרות</CardTitle>
        </CardHeader>
        <CardContent>
          <p>הגדרות המערכת יוצגו כאן</p>
        </CardContent>
      </Card>
    </div>
  );
};