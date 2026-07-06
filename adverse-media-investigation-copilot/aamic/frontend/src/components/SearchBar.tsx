import { Search, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const EXAMPLES = ["Wirecard", "FTX", "1MDB", "Danske Bank"];

export function SearchBar({ onSearch, isLoading, initialValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface p-2 shadow-panel"
      >
        <Search className="ml-2 h-4 w-4 shrink-0 text-ink-faint" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search Company or Person..."
          aria-label="Search company or person"
          className="h-10 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !value.trim()} className="shrink-0">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Investigating
            </>
          ) : (
            "Investigate"
          )}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
        <span>Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            disabled={isLoading}
            onClick={() => {
              setValue(example);
              onSearch(example);
            }}
            className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
