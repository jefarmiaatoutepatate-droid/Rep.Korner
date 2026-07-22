/**
 * Mini-backend proxy pour l'API Claude (§4 niveau 3).
 * La clé ANTHROPIC_API_KEY reste côté serveur (secret Worker), JAMAIS dans l'app.
 *
 * Endpoint : POST /estimate  body { food: string, quantity_g: number }
 * Réponse  : { kcal, protein_g, carbs_g, fat_g, confidence }
 */

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** Optionnel : liste d'origines autorisées séparées par des virgules. */
  ALLOWED_ORIGIN?: string;
}

const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `Tu es un expert en nutrition. On te donne un aliment et une quantité.
Tu réponds UNIQUEMENT en JSON strict avec les macros estimées :
{"kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "high"|"medium"|"low"}
Utilise les tables CIQUAL (ANSES) comme référence. Aucun texte hors du JSON.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/estimate') {
      return json({ error: 'Not found' }, 404, cors);
    }

    let body: { food?: string; quantity_g?: number };
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }
    if (!body.food) return json({ error: 'Missing "food"' }, 400, cors);

    const userInput = `${body.food} ${body.quantity_g ?? 100}g`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userInput }],
      }),
    });

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text();
      return json({ error: 'Upstream error', detail }, 502, cors);
    }

    const data = (await anthropicRes.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
    const parsed = extractJson(text);
    if (!parsed) return json({ error: 'Unparseable response', raw: text }, 502, cors);

    return json(parsed, 200, cors);
  },
};

/** Extrait le 1er objet JSON valide d'une string (robuste au texte parasite). */
function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}
