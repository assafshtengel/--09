import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary">
                SOCR
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                דף הבית
              </Link>
              <Link
                to="/pre-game-planner"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                תכנון טרום משחק
              </Link>
              <Link
                to="/pre-game-planner_NEW"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                תכנון טרום משחק חדש
              </Link>
              <Link
                to="/game-summary"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                סיכום משחק
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.full_name}
                      />
                      <AvatarFallback>
                        {user.user_metadata?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>פרופיל</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>התנתק</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button>התחבר</Button>
              </Link>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="space-y-4 py-4">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    דף הבית
                  </Link>
                  <Link
                    to="/pre-game-planner"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    תכנון טרום משחק
                  </Link>
                  <Link
                    to="/pre-game-planner_NEW"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    תכנון טרום משחק חדש
                  </Link>
                  <Link
                    to="/game-summary"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    סיכום משחק
                  </Link>
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        פרופיל
                      </Link>
                      <Button
                        onClick={() => signOut()}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>התנתק</span>
                      </Button>
                    </>
                  ) : (
                    <Link to="/login">
                      <Button className="w-full">התחבר</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};