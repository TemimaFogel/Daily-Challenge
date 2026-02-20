import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const navLink =
  "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2 rounded-md";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto flex h-14 items-center px-4 gap-6">
        <Link to="/" className="font-semibold text-foreground">
          Daily Challenge
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" className={cn(navLink)}>
            Dashboard
          </Link>
          <Link to="/demo" className={cn(navLink)}>
            Design demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
