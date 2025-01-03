import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Match = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>משחק מספר {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>תוכן המשחק יוצג כאן</p>
        </CardContent>
      </Card>
    </div>
  );
};