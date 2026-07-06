// Types mirroring backend/app/models.py - keep these in sync.

export type RiskLevel = "Low" | "Medium" | "High";

export type Recommendation =
  | "Approve"
  | "Review"
  | "Enhanced Due Diligence"
  | "Escalate"
  | "Reject";

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface Entities {
  people: string[];
  companies: string[];
  countries: string[];
  banks: string[];
  government_agencies: string[];
}

export interface Article {
  title: string;
  source: string;
  published_date: string;
  summary: string;
  link: string;
  content?: string | null;
}

export interface InvestigationReport {
  company: string;
  risk_score: number;
  risk_level: RiskLevel | string;
  confidence: number;
  summary: string;
  timeline: TimelineEvent[];
  entities: Entities;
  flags: string[];
  articles: Article[];
  recommendation: Recommendation | string;
  recommendation_reasoning: string;
  is_mock: boolean;
}

export interface InvestigateRequest {
  query: string;
}
