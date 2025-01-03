import { Card } from "@/components/ui/card";

export default function Index() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ברוכים הבאים</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">משחקים</h2>
          <p>צפייה וניהול משחקים</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">אימונים</h2>
          <p>מעקב אחר אימונים</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">סטטיסטיקות</h2>
          <p>נתונים ומדדים</p>
        </Card>
      </div>
    </div>
  );
};