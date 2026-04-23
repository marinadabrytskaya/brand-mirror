export type AeoAudit = {
  url: string;
  finalUrl?: string;
  totalScore: number;
  grade?: string;
  issues: string[];
  recommendations: string[];
  breakdown?: {
    schema?: {
      score?: number;
      max?: number;
      details?: Record<string, unknown>;
    };
    meta?: {
      score?: number;
      max?: number;
      details?: Record<string, unknown>;
    };
    content?: {
      score?: number;
      max?: number;
      details?: Record<string, unknown>;
    };
    technical?: {
      score?: number;
      max?: number;
      details?: Record<string, unknown>;
    };
    aiSignals?: {
      score?: number;
      max?: number;
      details?: Record<string, unknown>;
    };
  };
};

const AEO_MCP_URL = "https://aeo-mcp-server.amdal-dev.workers.dev/mcp";

function clampScore(value: unknown, fallback = 60) {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function parseAeoPayload(raw: unknown): AeoAudit | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;

  return {
    url: typeof data.url === "string" ? data.url : "",
    finalUrl: typeof data.finalUrl === "string" ? data.finalUrl : undefined,
    totalScore: clampScore(data.totalScore),
    grade: typeof data.grade === "string" ? data.grade : undefined,
    issues: safeArray(data.issues),
    recommendations: safeArray(data.recommendations),
    breakdown:
      data.breakdown && typeof data.breakdown === "object"
        ? (data.breakdown as AeoAudit["breakdown"])
        : undefined,
  };
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

export async function analyzeAeo(url: string): Promise<AeoAudit | null> {
  try {
    const response = await fetch(AEO_MCP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "analyze_aeo",
          arguments: { url },
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json().catch(() => null);
    const content = payload?.result?.content;
    if (!Array.isArray(content)) {
      return null;
    }

    for (const item of content) {
      if (item?.type !== "text" || typeof item?.text !== "string") {
        continue;
      }
      const parsed = extractJsonObject(item.text);
      const normalized = parseAeoPayload(parsed);
      if (normalized) {
        return normalized;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function summarizeAeoAudit(aeo: AeoAudit | null) {
  if (!aeo) {
    return "No external AEO technical audit was available for this run.";
  }

  const technical = aeo.breakdown?.technical?.details || {};
  const schema = aeo.breakdown?.schema?.details || {};
  const blocksGpt = technical.hasOwnProperty("blocksGpt")
    ? Boolean(technical.blocksGpt)
    : false;
  const blocksClaude = technical.hasOwnProperty("blocksClaude")
    ? Boolean(technical.blocksClaude)
    : false;
  const hasLlmsTxt = technical.hasOwnProperty("hasLlmsTxt")
    ? Boolean(technical.hasLlmsTxt)
    : false;
  const schemaCount =
    typeof schema.schemaBlockCount === "number" ? schema.schemaBlockCount : 0;

  return [
    `AEO technical audit score: ${aeo.totalScore}/100${aeo.grade ? ` (${aeo.grade})` : ""}.`,
    blocksGpt || blocksClaude
      ? "Some AI crawlers are blocked."
      : "AI crawlers are not visibly blocked.",
    hasLlmsTxt
      ? "llms.txt is present."
      : "llms.txt is missing.",
    schemaCount > 0
      ? `Structured data is present (${schemaCount} blocks), but still needs qualitative review.`
      : "Structured data is missing or negligible.",
    aeo.issues.length > 0
      ? `Main technical issues: ${aeo.issues.slice(0, 3).join("; ")}.`
      : "No major technical blockers were flagged by the AEO layer.",
  ].join(" ");
}
