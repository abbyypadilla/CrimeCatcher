import { Building2, Gauge, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { riskRingClass, riskTextClass } from "@/lib/risk";
import type { InvestigationReport } from "@/types/investigation";

interface SummaryCardsProps {
  report: InvestigationReport;
}

function RiskGauge({ score, level }: { score: number; level: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-border" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${riskRingClass(level)} transition-all duration-700 ease-out`}
        />
      </svg>
      <span className={`absolute font-display text-2xl font-bold ${riskTextClass(level)}`}>
        {score}
      </span>
    </div>
  );
}

export function SummaryCards({ report }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" /> Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-xl font-semibold leading-tight text-ink">
            {report.company}
          </p>
          {report.is_mock && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              Demo data - no AI key configured
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5" /> Risk Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <RiskGauge score={report.risk_score} level={report.risk_level} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5" /> Risk Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`font-display text-3xl font-bold uppercase tracking-tight ${riskTextClass(report.risk_level)}`}>
            {report.risk_level}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> AI Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-bold text-ink">{report.confidence}%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${report.confidence}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
