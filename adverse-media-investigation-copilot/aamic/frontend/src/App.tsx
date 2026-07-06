import { useCallback, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SummaryCards } from "@/components/SummaryCards";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { Timeline } from "@/components/Timeline";
import { RiskIndicators } from "@/components/RiskIndicators";
import { EntitiesPanel } from "@/components/EntitiesPanel";
import { NewsSources } from "@/components/NewsSources";
import { Recommendation } from "@/components/Recommendation";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { investigate, ApiError } from "@/lib/api";
import type { InvestigationReport } from "@/types/investigation";

type Status = "idle" | "loading" | "success" | "error";

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTerm, setActiveTerm] = useState<string | undefined>(undefined);

  const runInvestigation = useCallback(async (newQuery: string) => {
    setQuery(newQuery);
    setStatus("loading");
    setErrorMessage("");

    try {
      const result = await investigate(newQuery);
      setReport(result);
      setStatus("success");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, []);

  function handleReset() {
    setStatus("idle");
    setReport(null);
    setErrorMessage("");
    setQuery("");
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header activeTerms={activeTerm ? [activeTerm] : []} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {status === "idle" && <EmptyState onSearch={runInvestigation} isLoading={false} />}

        {status === "loading" && (
          <div className="mx-auto max-w-xl">
            <LoadingScreen query={query} onStageChange={setActiveTerm} />
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto max-w-xl space-y-4">
            <ErrorBanner message={errorMessage} onDismiss={() => setStatus("idle")} />
            <SearchBar onSearch={runInvestigation} isLoading={false} initialValue={query} />
          </div>
        )}

        {status === "success" && report && (
          <div className="print-area space-y-6 animate-fadeUp">
            <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl flex-1">
                <SearchBar onSearch={runInvestigation} isLoading={false} initialValue={query} />
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5" /> New Investigation
                </Button>
              </div>
            </div>

            <SummaryCards report={report} />
            <ExecutiveSummary summary={report.summary} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Timeline events={report.timeline} />
              <div className="space-y-6">
                <RiskIndicators flags={report.flags} />
                <Recommendation
                  recommendation={report.recommendation}
                  reasoning={report.recommendation_reasoning}
                />
              </div>
            </div>

            <EntitiesPanel entities={report.entities} />
            <NewsSources articles={report.articles} />
          </div>
        )}
      </main>

      <footer className="no-print mx-auto max-w-7xl px-6 py-8 text-center font-mono text-[11px] text-ink-faint">
        AI Adverse Media Investigation Copilot — hackathon MVP. Generated content should be
        verified by a qualified investigator before any decision is made.
      </footer>
    </div>
  );
}
