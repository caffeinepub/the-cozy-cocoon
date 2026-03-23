import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Leaf, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export function Header() {
  const { clear, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="w-full bg-header border-b border-border sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-none">
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              The
            </p>
            <p className="font-display text-base font-semibold text-foreground tracking-wide">
              Cozy Cocoon
            </p>
          </div>
        </div>

        {/* Right: user + logout */}
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {profile?.name && (
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {profile.name}
                </span>
              )}
            </div>
            <Button
              data-ocid="header.button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
