import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { severityDotClass } from "@/lib/risk";
import type { TimelineEvent } from "@/types/investigation";

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-3.5 w-3.5" /> Timeline of Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-ink-faint">No dated adverse events were identified.</p>
        ) : (
          <ol className="relative ml-2 border-l border-border pl-6">
            {events.map((event, i) => (
              <li key={i} className="mb-7 last:mb-0">
                <span
                  className={`absolute -left-[29px] mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-surface ${severityDotClass(
                    event.severity
                  )}`}
                />
                <span className="font-mono text-xs font-semibold tracking-wide text-accent">
                  {event.year}
                </span>
                <h4 className="mt-0.5 font-display text-sm font-semibold text-ink">
                  {event.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{event.description}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
