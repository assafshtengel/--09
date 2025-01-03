import { Card } from "@/components/ui/card";

export const PlayerPortfolio = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">תיק שחקן</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">הישגים</h2>
          <p>רשימת הישגים ומדליות</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">סטטיסטיקות</h2>
          <p>נתונים ומדדים מצטברים</p>
        </Card>
      </div>
    </div>
  );
};