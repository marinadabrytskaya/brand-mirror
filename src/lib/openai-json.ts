export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const SAFE_OPENAI_FALLBACK_MODEL = "gpt-4o-mini";
export const DEFAULT_OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "arcee-ai/trinity-large-thinking";

export type ModelScope = "brand-read" | "brand-report" | "generic";
export type ModelProvider = "openai" | "openrouter";

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

function toModelError(provider: ModelProvider, status: number, detail: string) {
  if (provider === "openai") {
    return toOpenAIError(status, detail);
  }

  const providerLabel = "OpenRouter";

  if (
    status === 400 &&
    /invalid model id|model.*does not exist|unsupported model/i.test(detail)
  ) {
    return new ModelApiError(
      `${providerLabel} request failed: ${status} ${detail}`,
      400,
      `${providerLabel} model configuration is invalid.`,
    );
  }

  if (status === 401) {
    return new ModelApiError(
      `${providerLabel} request failed: ${status} ${detail}`,
      401,
      `${providerLabel} API key is missing or invalid.`,
    );
  }

  if (status === 402) {
    return new ModelApiError(
      `${providerLabel} request failed: ${status} ${detail}`,
      402,
      `${providerLabel} needs credits before it can generate this report.`,
    );
  }

  if (status === 429) {
    return new ModelApiError(
      `${providerLabel} request failed: ${status} ${detail}`,
      429,
      `${providerLabel} rate limit reached. Please try again in a minute.`,
    );
  }

  if (status >= 500) {
    return new ModelApiError(
      `${providerLabel} request failed: ${status} ${detail}`,
      status,
      `${providerLabel} is temporarily unavailable. Please try again in a minute.`,
    );
  }

  return new ModelApiError(
    `${providerLabel} request failed: ${status} ${detail}`,
    status,
    "Unable to generate the brand report right now.",
  );
}

function readEnv(name: string) {
  return (process.env[name] || "").trim();
}

function normalizeProvider(value: string | undefined): ModelProvider | null {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "openai" || normalized === "openrouter") {
    return normalized;
  }
  return null;
}

export function resolveModelProvider(scope: ModelScope): ModelProvider {
  const scopedProvider =
    scope === "brand-report"
      ? process.env.BRAND_REPORT_MODEL_PROVIDER
      : scope === "brand-read"
        ? process.env.BRAND_READ_MODEL_PROVIDER
        : undefined;

  return (
    normalizeProvider(scopedProvider) ||
    normalizeProvider(process.env.MODEL_PROVIDER) ||
    "openai"
  );
}

export function hasConfiguredChatModel(scope: ModelScope) {
  const provider = resolveModelProvider(scope);
  if (provider === "openrouter") {
    return Boolean(readEnv("OPENROUTER_API_KEY") || readEnv("OPENAI_API_KEY"));
  }
  return Boolean(readEnv("OPENAI_API_KEY"));
}

function resolveChatModel(scope: ModelScope, provider: ModelProvider) {
  if (provider === "openrouter") {
    return readEnv("OPENROUTER_MODEL") || DEFAULT_OPENROUTER_MODEL;
  }
  const scopedModel =
    scope === "brand-report"
      ? readEnv("BRAND_REPORT_OPENAI_MODEL")
      : scope === "brand-read"
        ? readEnv("BRAND_READ_OPENAI_MODEL")
        : "";
  return scopedModel || readEnv("OPENAI_MODEL") || SAFE_OPENAI_FALLBACK_MODEL;
}

function resolveChatEndpoint(provider: ModelProvider) {
  if (provider === "openrouter") {
    return "https://openrouter.ai/api/v1/chat/completions";
  }
  return "https://api.openai.com/v1/chat/completions";
}

function resolveChatApiKey(provider: ModelProvider) {
  if (provider === "openrouter") {
    return readEnv("OPENROUTER_API_KEY");
  }
  return readEnv("OPENAI_API_KEY");
}

function resolveOpenRouterHeaders() {
  const headers: Record<string, string> = {};
  const siteUrl =
    readEnv("NEXT_PUBLIC_SITE_URL") ||
    readEnv("VERCEL_PROJECT_PRODUCTION_URL") ||
    readEnv("VERCEL_URL");

  if (siteUrl) {
    headers["HTTP-Referer"] = siteUrl.startsWith("http")
      ? siteUrl
      : `https://${siteUrl}`;
  }

  headers["X-Title"] = "Brand Mirror";
  return headers;
}

type OpenAITextPayload = {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{
      text?: unknown;
    }>;
  }>;
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
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

export async function requestChatJsonText(options: {
  scope: ModelScope;
  messages: ChatMessage[];
  temperature?: number;
  timeoutMs?: number;
  retries?: number;
}) {
  let provider = resolveModelProvider(options.scope);
  let apiKey = resolveChatApiKey(provider);

  if (!apiKey && provider === "openrouter" && readEnv("OPENAI_API_KEY")) {
    provider = "openai";
    apiKey = resolveChatApiKey(provider);
  }

  if (!apiKey) {
    return null;
  }

  const endpoint = resolveChatEndpoint(provider);
  const model = resolveChatModel(options.scope, provider);
  const retries = options.retries ?? 3;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? 30000,
    );

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(provider === "openrouter" ? resolveOpenRouterHeaders() : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          response_format: { type: "json_object" },
        }),
      }).finally(() => clearTimeout(timeout));

      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw toModelError(provider, response.status, errorText);
      }

      const payload = (await response.json()) as ChatCompletionPayload;
      const text = payload?.choices?.[0]?.message?.content;

      if (typeof text !== "string" || !text.trim()) {
        throw new ModelApiError(
          `${provider} returned an empty response`,
          502,
          "The model returned an empty response. Please try again.",
        );
      }

      return text;
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof ModelApiError) {
        throw error;
      }

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        continue;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ModelApiError(
          `${provider} request timed out`,
          504,
          "The model took too long to respond. Please try again.",
        );
      }

      throw new ModelApiError(
        error instanceof Error ? error.message : `${provider} request failed`,
        500,
        "Unable to generate the brand report right now.",
      );
    }
  }

  throw new ModelApiError(
    "Model retry logic exhausted",
    500,
    "Unable to generate the brand report right now.",
  );
}
