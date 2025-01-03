import { Card } from "@/components/ui/card";

export const Profile = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">פרופיל</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">פרטים אישיים</h2>
            <p>עריכת פרטי המשתמש</p>
          </div>
        </div>
      </Card>
    </div>
  );
};