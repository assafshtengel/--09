import { Bell, User } from "lucide-react";
import { NavLink } from "./NavLink";

export const UserLinks = () => {
  return (
    <>
      <NavLink to="/notifications" icon={Bell} label="התראות" />
      <NavLink to="/profile" icon={User} label="פרופיל" />
    </>
  );
};