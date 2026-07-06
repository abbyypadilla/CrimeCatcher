import { cn } from "@/lib/utils";

interface StatusTickerProps {
  /** Terms that are actively being scanned / highlighted, e.g. during loading. */
  activeTerms?: string[];
  className?: string;
}

const TAXONOMY = [
  "AML",
  "SANCTIONS",
  "PEP SCREENING",
  "KYC",
  "EDD",
  "FRAUD",
  "BRIBERY",
  "SHELL ENTITIES",
  "CYBERCRIME",
  "TAX EVASION",
  "CORRUPTION",
  "ASSET FREEZE",
];

export function StatusTicker({ activeTerms = [], className }: StatusTickerProps) {
  const items = [...TAXONOMY, ...TAXONOMY]; // duplicated for seamless loop

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-border bg-navy-950 text-white/70",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex w-max animate-ticker whitespace-nowrap py-1.5 font-mono text-[11px] tracking-widest">
        {items.map((term, i) => {
          const isActive = activeTerms.includes(term);
          return (
            <span key={`${term}-${i}`} className="flex items-center px-4">
              <span
                className={cn(
                  "mr-2 h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-accent animate-pulseDot" : "bg-white/20"
                )}
              />
              <span className={isActive ? "text-white" : undefined}>{term}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
