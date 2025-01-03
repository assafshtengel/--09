import { Card } from "@/components/ui/card";

export const Admin = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ניהול מערכת</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">משתמשים</h2>
          <p>ניהול משתמשים ותפקידים</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">משחקים</h2>
          <p>ניהול משחקים וסטטיסטיקות</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">דוחות</h2>
          <p>צפייה בדוחות מערכת</p>
        </Card>
      </div>
    </div>
  );
};