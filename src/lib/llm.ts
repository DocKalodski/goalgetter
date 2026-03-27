/**
 * Unified LLM client — Groq (primary, free) → Gemini (fallback, free)
 *
 * Groq free limits:   14,400 req/day | 30 req/min | console.groq.com
 * Gemini free limits:  1,500 req/day | 15 req/min | aistudio.google.com
 *
 * Auto-fallback: if Groq returns 429 (rate limit) or 503, retries on Gemini.
 * Quota warnings are logged to console so they surface in Next.js server logs.
 *
 * Model tiers:
 *   "fast"  → llama-3.1-8b-instant / gemini-2.0-flash  (JSON extraction, short tasks)
 *   "smart" → llama-3.3-70b-versatile / gemini-2.0-flash (analysis, coaching summaries)
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL = (model: string, key: string, stream = false) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:${stream ? "streamGenerateContent?alt=sse&" : "generateContent?"}key=${key}`;

const GROQ_MODELS = {
  fast: "llama-3.1-8b-instant",
  smart: "llama-3.3-70b-versatile",
} as const;

const GEMINI_MODEL = "gemini-2.0-flash";

type ModelTier = "fast" | "smart";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMOptions {
  tier?: ModelTier;
  maxTokens?: number;
  system?: string;
}

// ─── Quota / rate-limit warning ──────────────────────────────────────────────

function warnQuota(provider: string, status: number) {
  const links: Record<string, string> = {
    Groq: "console.groq.com  →  Usage  (resets daily, ~14,400 req free)",
    Gemini: "aistudio.google.com  →  API keys  (resets daily, ~1,500 req free)",
  };
  if (status === 429) {
    console.warn(
      `\n⚠️  [LLM] ${provider} RATE LIMIT (429) — quota may be exhausted.\n` +
      `   Check: ${links[provider]}\n` +
      `   Daily quotas reset at midnight UTC.\n`
    );
  }
}

// ─── Groq ────────────────────────────────────────────────────────────────────

async function groqChat(messages: LLMMessage[], options: LLMOptions): Promise<{ text: string; ok: boolean; status: number }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { text: "", ok: false, status: 0 };

  const { tier = "fast", maxTokens = 1024, system } = options;
  const model = GROQ_MODELS[tier];

  const payload = {
    model,
    max_tokens: maxTokens,
    messages: system
      ? [{ role: "system", content: system }, ...messages]
      : messages,
  };

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    warnQuota("Groq", res.status);
    return { text: "", ok: false, status: res.status };
  }

  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content ?? "", ok: true, status: 200 };
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

function toGeminiMessages(messages: LLMMessage[], system?: string) {
  // Gemini uses {role:"user"|"model", parts:[{text}]}
  // System prompt is prepended as first user turn
  const contents: { role: string; parts: { text: string }[] }[] = [];

  if (system) {
    contents.push({ role: "user", parts: [{ text: system }] });
    contents.push({ role: "model", parts: [{ text: "Understood." }] });
  }

  for (const m of messages) {
    if (m.role === "system") continue; // already handled above
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    });
  }
  return contents;
}

async function geminiChat(messages: LLMMessage[], options: LLMOptions): Promise<{ text: string; ok: boolean; status: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { text: "", ok: false, status: 0 };

  const { maxTokens = 1024, system } = options;

  const payload = {
    contents: toGeminiMessages(messages, system),
    generationConfig: { maxOutputTokens: maxTokens },
  };

  const res = await fetch(GEMINI_URL(GEMINI_MODEL, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    warnQuota("Gemini", res.status);
    return { text: "", ok: false, status: res.status };
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text, ok: true, status: 200 };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send messages and get a text response.
 * Tries Groq first; auto-falls back to Gemini on rate limit (429) or error.
 */
export async function llmChat(messages: LLMMessage[], options: LLMOptions = {}): Promise<string> {
  const groq = await groqChat(messages, options);
  if (groq.ok) return groq.text;

  // Fallback to Gemini
  console.warn(`[LLM] Falling back to Gemini (Groq status: ${groq.status})`);
  const gemini = await geminiChat(messages, options);
  if (gemini.ok) return gemini.text;

  throw new Error(
    `All LLM providers failed. Groq: ${groq.status}, Gemini: ${gemini.status}.\n` +
    `Check quotas: console.groq.com | aistudio.google.com`
  );
}

/**
 * Streaming variant — returns a ReadableStream of text chunks.
 * Tries Groq SSE stream; falls back to Gemini non-streaming on failure.
 */
export async function llmStream(messages: LLMMessage[], options: LLMOptions = {}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY;
  const { tier = "smart", maxTokens = 1024, system } = options;
  const encoder = new TextEncoder();

  if (apiKey) {
    const payload = {
      model: GROQ_MODELS[tier],
      max_tokens: maxTokens,
      stream: true,
      messages: system
        ? [{ role: "system", content: system }, ...messages]
        : messages,
    };

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const decoder = new TextDecoder();
      return new ReadableStream({
        async start(controller) {
          const reader = res.body!.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              for (const line of chunk.split("\n")) {
                const trimmed = line.replace(/^data: /, "").trim();
                if (!trimmed || trimmed === "[DONE]") continue;
                try {
                  const json = JSON.parse(trimmed);
                  const text = json.choices?.[0]?.delta?.content ?? "";
                  if (text) controller.enqueue(encoder.encode(text));
                } catch { /* skip malformed SSE */ }
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });
    }

    warnQuota("Groq", res.status);
    console.warn(`[LLM] Groq stream failed (${res.status}), falling back to Gemini non-stream`);
  }

  // Gemini fallback — non-streaming (wrap response as single-chunk stream)
  const gemini = await geminiChat(messages, options);
  if (!gemini.ok) {
    throw new Error(`All LLM providers failed. Check quotas: console.groq.com | aistudio.google.com`);
  }

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(gemini.text));
      controller.close();
    },
  });
}
