import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Header() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🛕</span>
          <div>
            <div className="font-display font-bold text-sm text-primary leading-tight">
              Namma Nayakanahatti
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              Your Temple Town Delivery App
            </div>
          </div>
        </Link>
        {identity ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            data-ocid="header.logout.button"
            className="text-muted-foreground"
          >
            <LogOut size={16} />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="header.login.button"
            className="bg-primary text-primary-foreground text-xs px-3"
          >
            <LogIn size={14} className="mr-1" />
            {isLoggingIn ? "Signing in..." : "Login"}
          </Button>
        )}
      </div>
    </header>
  );
}
