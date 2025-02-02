import { Home, ClipboardList, Trophy, User, Book, Bell, Calendar } from "lucide-react";
import { NavLink } from "./NavLink";

export const MainLinks = () => {
  return (
    <>
      <NavLink to="/dashboard" icon={Home} label="דף הבית" />
      <NavLink to="/pre-match-report" icon={ClipboardList} label="דוח טרום משחק" />
      <NavLink to="/game-summary" icon={Trophy} label="סיכום משחק" />
      <NavLink to="/portfolio" icon={User} label="פורטפוליו" />
      <NavLink to="/mental-learning" icon={Book} label="למידה מנטלית" />
      <NavLink to="/notifications" icon={Bell} label="התראות" />
      <NavLink to="/schedule" icon={Calendar} label="לוח זמנים" />
    </>
  );
};