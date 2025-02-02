import { Home, ClipboardList, Trophy, Calendar } from "lucide-react";
import { NavLink } from "./NavLink";

export const MainLinks = () => {
  return (
    <>
      <NavLink to="/dashboard" icon={Home} label="דף הבית" />
      <NavLink to="/pre-match-report" icon={ClipboardList} label="דוח טרום משחק" />
      <NavLink to="/game-summary" icon={Trophy} label="סיכום משחק" />
      <NavLink to="/schedule" icon={Calendar} label="לוח זמנים" />
    </>
  );
};