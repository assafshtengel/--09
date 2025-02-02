import { MainLinks } from "./navigation/MainLinks";
import { UserLinks } from "./navigation/UserLinks";
import { AuthSection } from "./navigation/AuthSection";

export const Navigation = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <MainLinks />
          </div>
          <div className="flex items-center gap-2">
            <UserLinks />
            <AuthSection />
          </div>
        </div>
      </div>
    </nav>
  );
};