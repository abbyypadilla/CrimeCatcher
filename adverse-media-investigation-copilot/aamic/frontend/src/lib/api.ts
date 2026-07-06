import type { InvestigationReport } from "@/types/investigation";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ApiError extends Error {}

/**
 * Run a full adverse media investigation for the given subject.
 * Throws ApiError with a user-presentable message on failure.
 */
export async function investigate(query: string): Promise<InvestigationReport> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the investigation service. Confirm the backend is running on " + API_URL
    );
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // ignore - keep default message
    }
    throw new ApiError(detail);
  }

  return response.json();
}

/** Lightweight backend health check, used to show a connection indicator. */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
