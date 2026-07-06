import { useState } from "react";
import { ChevronDown, ExternalLink, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/investigation";

interface NewsSourcesProps {
  articles: Article[];
}

function formatDate(raw: string): string {
  if (!raw) return "Date unavailable";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function ArticleRow({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = Boolean(article.content && article.content.trim().length > 0);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold leading-snug text-ink">
            {article.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
            <Badge variant="outline">{article.source}</Badge>
            <span className="font-mono">{formatDate(article.published_date)}</span>
          </div>
        </div>
        {hasExtra && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label="Toggle full article content"
            className="shrink-0 rounded-md p-1 text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{article.summary}</p>

      {expanded && hasExtra && (
        <p className="mt-2 border-t border-border pt-2 text-sm leading-relaxed text-ink-muted">
          {article.content}
        </p>
      )}

      {article.link && (
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          Read source <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

export function NewsSources({ articles }: NewsSourcesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5" /> News Sources ({articles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <p className="text-sm text-ink-faint">No source articles were retrieved.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article, i) => (
              <ArticleRow key={`${article.link}-${i}`} article={article} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
