import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatusTicker } from "@/components/StatusTicker";

interface HeaderProps {
  activeTerms?: string[];
}

export function Header({ activeTerms }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-navy-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 ring-1 ring-accent/40">
            <ShieldCheck className="h-5 w-5 text-accent" strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold leading-tight tracking-tight sm:text-lg">
              AI Adverse Media Investigation Copilot
            </h1>
            <p className="text-xs text-white/60">
              Investigate companies and individuals using AI.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
      <StatusTicker activeTerms={activeTerms} />
    </header>
  );
}
