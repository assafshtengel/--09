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
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-full">{icon}</div>
          <CardTitle className="text-base md:text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 text-sm md:text-base leading-relaxed">
          {description}
        </CardDescription>
        <Button 
          className="w-full h-12 md:h-10 text-base" 
          onClick={() => navigate(path)}
        >
          התחל
        </Button>
      </CardContent>
    </Card>
  );
};