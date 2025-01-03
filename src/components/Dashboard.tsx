import { Card } from "@/components/ui/card";

export const Dashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">לוח בקרה</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">סטטיסטיקות</h2>
          <p>נתונים ומדדים אישיים</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">משחקים אחרונים</h2>
          <p>סיכום משחקים אחרונים</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">יעדים</h2>
          <p>מעקב אחר יעדים ומטרות</p>
        </Card>
      </div>
    </div>
  );
};