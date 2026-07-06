import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STAGES = [
  { label: "Searching News...", term: "AML" },
  { label: "Searching Sanctions...", term: "SANCTIONS" },
  { label: "Reading Articles...", term: "KYC" },
  { label: "Removing Duplicates...", term: "EDD" },
  { label: "Extracting Entities...", term: "PEP SCREENING" },
  { label: "Generating Timeline...", term: "FRAUD" },
  { label: "Generating Risk Score...", term: "CORRUPTION" },
  { label: "Preparing Report...", term: "ASSET FREEZE" },
];

interface LoadingScreenProps {
  query: string;
  onStageChange?: (term: string) => void;
}

export function LoadingScreen({ query, onStageChange }: LoadingScreenProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1 < STAGES.length ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onStageChange?.(STAGES[stageIndex].term);
  }, [stageIndex, onStageChange]);

  const progressPct = Math.min(100, ((stageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-border bg-surface px-8 py-16 text-center shadow-panel animate-fadeUp">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-accent/20" />
        <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={2} />
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          Investigating
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-ink">{query}</p>
      </div>

      <p className="font-mono text-sm text-ink-muted" role="status" aria-live="polite">
        {STAGES[stageIndex].label}
      </p>

      <div className="w-full max-w-sm">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
          <span>STEP {stageIndex + 1} / {STAGES.length}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
      </div>
    </div>
  );
}
