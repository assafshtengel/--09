import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

export const RoleCard = ({ title, description, icon, path }: RoleCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 text-right">{description}</CardDescription>
        <Button 
          className="w-full" 
          onClick={() => navigate(path)}
        >
          התחל
        </Button>
      </CardContent>
    </Card>
  );
};