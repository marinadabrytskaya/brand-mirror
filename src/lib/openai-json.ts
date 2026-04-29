export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const SAFE_OPENAI_FALLBACK_MODEL = "gpt-4o-mini";

export class ModelApiError extends Error {
  status: number;
  publicDetail: string;

  constructor(message: string, status = 500, publicDetail = message) {
    super(message);
    this.name = "ModelApiError";
    this.status = status;
    this.publicDetail = publicDetail;
  }
}

function toOpenAIError(status: number, detail: string) {
  if (
    status === 400 &&
    /invalid model id|model.*does not exist|unsupported model/i.test(detail)
  ) {
    return new ModelApiError(
      `OpenAI request failed: ${status} ${detail}`,
      400,
      "OpenAI model configuration is invalid. Falling back to a safe default is required.",
    );
  }

  if (status === 401) {
    return new ModelApiError(
      `OpenAI request failed: ${status} ${detail}`,
      401,
      "OpenAI API key is missing or invalid.",
    );
  }

  if (status === 429) {
    return new ModelApiError(
      `OpenAI request failed: ${status} ${detail}`,
      429,
      "OpenAI rate limit reached. Please try again in a minute.",
    );
  }

  if (status >= 500) {
    return new ModelApiError(
      `OpenAI request failed: ${status} ${detail}`,
      status,
      "OpenAI is temporarily unavailable. Please try again in a minute.",
    );
  }

  return new ModelApiError(
    `OpenAI request failed: ${status} ${detail}`,
    status,
    "Unable to generate the brand read right now.",
  );
}

type OpenAITextPayload = {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{
      text?: unknown;
    }>;
  }>;
};

function extractOutputText(payload: OpenAITextPayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const fragments: string[] = [];

  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") {
        fragments.push(content.text);
      }
    }
  }

  return fragments.join("").trim();
}

export async function requestOpenAIJsonText(
  prompt: string,
  options?: {
    model?: string;
    timeoutMs?: number;
    allowModelFallback?: boolean;
  },
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const selectedModel = options?.model || DEFAULT_OPENAI_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 30000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: selectedModel,
        input: prompt,
        store: false,
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text();
      const invalidModel =
        response.status === 400 &&
        /invalid model id|model.*does not exist|unsupported model/i.test(errorText);

      if (
        invalidModel &&
        (options?.allowModelFallback ?? true) &&
        selectedModel !== SAFE_OPENAI_FALLBACK_MODEL
      ) {
        return requestOpenAIJsonText(prompt, {
          ...options,
          model: SAFE_OPENAI_FALLBACK_MODEL,
          allowModelFallback: false,
        });
      }

      throw toOpenAIError(response.status, errorText);
    }

    const payload = await response.json();
    const text = extractOutputText(payload);

    if (!text) {
      throw new ModelApiError(
        "OpenAI returned an empty response",
        502,
        "OpenAI returned an empty response. Please try again.",
      );
    }

    return text;
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof ModelApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ModelApiError(
        "OpenAI request timed out",
        504,
        "OpenAI took too long to respond. Please try again.",
      );
    }

    throw new ModelApiError(
      error instanceof Error ? error.message : "OpenAI request failed",
      500,
      "Unable to generate the brand read right now.",
    );
  }
}
