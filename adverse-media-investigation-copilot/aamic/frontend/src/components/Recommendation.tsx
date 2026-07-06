import { Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recommendationVariant } from "@/lib/risk";

interface RecommendationProps {
  recommendation: string;
  reasoning: string;
}

export function Recommendation({ recommendation, reasoning }: RecommendationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-3.5 w-3.5" /> AI Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge
          variant={recommendationVariant(recommendation)}
          className="font-display text-sm normal-case px-3 py-1.5"
        >
          {recommendation}
        </Badge>
        {reasoning && (
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{reasoning}</p>
        )}
      </CardContent>
    </Card>
  );
}
