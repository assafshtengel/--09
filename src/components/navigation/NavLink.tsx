import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label?: string;
}

export const NavLink = ({ to, icon: Icon, label }: NavLinkProps) => {
  return (
    <Link to={to}>
      <Button variant="ghost" size="icon" title={label}>
        <Icon className="h-5 w-5" />
      </Button>
    </Link>
  );
};