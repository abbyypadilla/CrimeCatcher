import { Clock3, FileSearch, ScanSearch } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

interface EmptyStateProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const STEPS = [
  { icon: ScanSearch, label: "Scans Google News, sanctions screens, and public filings" },
  { icon: FileSearch, label: "Extracts entities, risk flags, and a chronological timeline" },
  { icon: Clock3, label: "Delivers a case-ready report in under 2 minutes" },
];

export function EmptyState({ onSearch, isLoading }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-20 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Financial Crime · AML · Investigations
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Adverse media research,
          <br />
          minutes instead of hours.
        </h2>
        <p className="mt-3 text-ink-muted">
          Enter a company or individual to generate an AI-assisted investigation report,
          built on live news and a structured AML risk framework.
        </p>
      </div>

      <SearchBar onSearch={onSearch} isLoading={isLoading} />

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-xs text-ink-muted"
          >
            <Icon className="h-4 w-4 text-accent" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
