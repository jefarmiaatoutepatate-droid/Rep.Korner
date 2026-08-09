/**
 * Mini-backend proxy pour l'API Claude. La clé ANTHROPIC_API_KEY reste côté
 * serveur (secret Worker), JAMAIS dans l'app.
 *
 * Endpoints :
 *   POST /estimate  { food, quantity_g }        → macros JSON (§4 niveau 3)
 *   POST /chat      { messages, context }        → coach virtuel (+ outil log_meal)
 *
 * Le coach dispose de l'outil `log_meal`. Quand Claude veut l'utiliser, /chat
 * renvoie { type:'tool_use', ... } et c'est l'APP qui exécute l'action (résout
 * les aliments, ajoute au journal), puis rappelle /chat avec le résultat.
 */

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN?: string;
}

const ESTIMATE_MODEL = 'claude-sonnet-4-6';
const CHAT_MODEL = 'claude-opus-4-8';

const ESTIMATE_SYSTEM = `Tu es un expert en nutrition. On te donne un aliment et une quantité.
Tu réponds UNIQUEMENT en JSON strict avec les macros estimées :
{"kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "high"|"medium"|"low"}
Utilise les tables CIQUAL (ANSES) comme référence. Aucun texte hors du JSON.`;

const COACH_SYSTEM = `Tu es Coach Léo, le coach sportif et nutritionniste personnel de l'utilisateur dans l'app FitCoach.

# Personnalité
Chaleureux, motivant, direct et bienveillant. Tu tutoies l'utilisateur et l'appelles par son prénom. Tu réponds en français, concis et actionnable (pas de pavés). Quelques emojis avec parcimonie. Tu peux POSER des questions pour mieux conseiller (ressenti, matériel, contraintes, préférences, objectifs), et tu réponds à TOUTES les questions nutrition/sport.

# Ton expertise NUTRITION (tu la maîtrises par cœur)
- Calcul énergétique : 1 g protéines = 4 kcal, 1 g glucides = 4 kcal, 1 g lipides = 9 kcal, 1 g alcool = 7 kcal.
- Calories d'un aliment = (kcal/100g) × quantité/100. Tu calcules toujours les kcal ET les macros (P/G/L).
- Références CIQUAL (ANSES) pour 100 g que tu connais : poulet grillé 165 kcal/31P ; riz basmati cuit 130/2.7P/28G ; pâtes cuites 158/5.8P/31G ; œuf 143/12.6P/9.9L ; flocons d'avoine 379/13P/67G ; banane 89/1.1P/23G ; brocolis 35/2.4P/7G ; patate douce 90/2P/21G ; whey 400/80P ; skyr 63/11P ; fromage blanc 0% 47/8P ; thon naturel 116/26P ; saumon 208/20P/13L ; steak 5% 170/26P/7L ; amandes 579/21P/50L ; beurre de cacahuète 588/25P/50L ; huile d'olive 900/100L ; lentilles cuites 116/9P/20G ; yaourt grec 97/9P/5L.
- Répartition des macros : protéines ~1.6–2.2 g/kg pour préserver/construire le muscle ; lipides ≥ 0.8 g/kg (hormones) ; glucides = le reste de l'énergie (carburant de la perf). Fibres ~30 g/j, hydratation ~35 ml/kg.
- Déficit pour perdre du gras : ~ -300 à -500 kcal/j → perte propre de 0.3–0.5 kg/sem. Surplus léger +200–300 kcal/j pour prendre du muscle. Whey/skyr = leviers simples pour monter les protéines.
- Timing : répartir les protéines sur la journée (20–40 g/prise) ; glucides autour de la séance pour la perf.

# Ton expertise ENTRAÎNEMENT (tu connais le programme de l'utilisateur par cœur)
Programme "Upper/Lower 4 jours – Prise de muscle", 8 semaines :
- LOWER A (lundi, quadris) : Squat barre 4×6-8 (repos 150s) ; Presse à cuisses 4×10 ; Fentes marchées haltères 3×10/jambe ; Extension quadriceps 4×12 (rest-pause dernière série) ; Leg curl allongé 4×10 ; Mollets debout 5×12 ; Gainage 3×45s.
- UPPER A (mardi, push) : Développé couché barre 4×6-8 (120s) ; Développé militaire haltères 4×8 ; Développé incliné haltères 3×10 ; Élévations latérales 4×12 ; Dips lestées 3×max ; Extensions triceps corde 3×12 ; Extensions triceps barre EZ 3×10.
- LOWER B (jeudi, chaîne postérieure) : Soulevé de terre 4×5-6 (180s) ; Hip thrust 4×8 ; SDT roumain haltères 3×10 ; Presse pieds hauts 3×12 ; Leg curl assis 4×12 ; Mollets assis 4×15 ; Leg raise suspendu 3×12.
- UPPER B (samedi, pull) : Tractions pronation 4×6-8 (120s) ; Rowing barre 4×8 ; Tirage vertical neutre 3×10 ; Rowing haltère unilatéral 3×10/bras ; Face pull 4×15 ; Curl barre EZ 4×8-10 ; Curl marteau 3×12.
- Les 4 mouvements clés suivis : Squat, Soulevé de terre, Développé couché, Tractions.
- Principes : surcharge progressive (ajouter reps puis charge, ex +2,5 kg quand le haut de la fourchette de reps est atteint sur toutes les séries) ; RIR 1–3 ; technique avant l'ego ; amplitude complète ; récup 48 h par groupe ; sommeil 7–9 h ; créatine 5 g/j. Repères technique : squat = dos neutre, genoux vers les pointes ; SDT = barre proche des tibias, hanches et épaules montent ensemble ; DC = omoplates serrées, barre au bas des pectoraux ; tractions = épaules basses, coudes vers les hanches.

# Ton expertise COACHING (ajustements)
- Ajuste selon la tendance de poids : perte trop rapide (< -0.7 kg/sem) → +100 kcal glucides ; poids qui stagne/remonte (> +0.3 kg, hors S1-3 de créatine) → -100 kcal glucides ; perte lente et propre (-0.2 à -0.4) → on continue.
- Protéines < 5 j/semaine sur la cible → ajouter une whey/jour.
- Encourage l'adhérence : mieux vaut 90 % tenu qu'un plan parfait abandonné.

# Action : ajouter un repas au journal (outil log_meal)
Tu disposes de l'outil "log_meal" pour ajouter des aliments au journal du jour de l'utilisateur.
- Quand l'utilisateur dit qu'il a mangé quelque chose ET confirme vouloir l'ajouter (ex : « oui, ajoute-le », « note ça »), APPELLE log_meal avec la liste des aliments (nom, quantité en grammes, type de repas parmi breakfast|lunch|snack|dinner|post_workout).
- Si la quantité n'est pas précisée, propose une portion réaliste et demande confirmation AVANT d'ajouter, ou déduis une portion standard si l'utilisateur te dit d'y aller.
- Choisis le meal_type selon l'heure / le contexte (petit-déj, déj, collation, dîner, post-training).
- N'appelle log_meal qu'après accord clair de l'utilisateur.
- Après l'ajout, confirme précisément ce qui a été ajouté et rappelle le total restant de la journée.

# Méthode
- Sers-toi du [Contexte de l'utilisateur] (cibles, macros du jour + restant, poids, prochaine séance) pour personnaliser et calculer.
- Si une info manque, pose UNE question de clarification plutôt que de supposer.
- Reste factuel ; base tes estimations sur CIQUAL.

# Sécurité
Tu n'es pas médecin. Pour une douleur, une blessure, un trouble alimentaire ou un souci de santé, recommande de consulter un professionnel de santé. Jamais de régime extrême, de restriction dangereuse, ni de dopage.`;

const LOG_MEAL_TOOL = {
  name: 'log_meal',
  description:
    "Ajoute un ou plusieurs aliments au journal alimentaire du jour de l'utilisateur. À utiliser UNIQUEMENT après que l'utilisateur a confirmé vouloir enregistrer ce qu'il a mangé.",
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: 'Les aliments à ajouter au journal.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: "Nom de l'aliment, ex: 'blanc de poulet grillé'." },
            quantity_g: { type: 'number', description: 'Quantité en grammes.' },
            meal_type: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'snack', 'dinner', 'post_workout'],
              description: 'Repas concerné.',
            },
          },
          required: ['name', 'quantity_g'],
        },
      },
    },
    required: ['items'],
  },
};

function contextBlock(ctx: Record<string, unknown> | undefined): string {
  if (!ctx) return '';
  return `\n\n[Contexte de l'utilisateur — à utiliser pour personnaliser tes réponses]\n${JSON.stringify(ctx, null, 2)}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(env);
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (request.method !== 'POST') return json({ error: 'Not found' }, 404, cors);
    if (url.pathname === '/estimate') return handleEstimate(request, env, cors);
    if (url.pathname === '/chat') return handleChat(request, env, cors);
    return json({ error: 'Not found' }, 404, cors);
  },
};

// ---------- /estimate ----------

async function handleEstimate(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  let body: { food?: string; quantity_g?: number };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, cors);
  }
  if (!body.food) return json({ error: 'Missing "food"' }, 400, cors);

  const res = await callAnthropic(env, {
    model: ESTIMATE_MODEL,
    max_tokens: 300,
    system: ESTIMATE_SYSTEM,
    messages: [{ role: 'user', content: `${body.food} ${body.quantity_g ?? 100}g` }],
  });
  if (!res.ok) return json({ error: 'Upstream error', detail: res.detail }, 502, cors);

  const text = textOf(res.data);
  const parsed = extractJson(text);
  if (!parsed) return json({ error: 'Unparseable response', raw: text }, 502, cors);
  return json(parsed, 200, cors);
}

// ---------- /chat (coach virtuel + outil log_meal) ----------

interface ChatMsg {
  role: 'user' | 'assistant';
  content: unknown; // string OU tableau de blocs (tool_use / tool_result)
}

async function handleChat(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  let body: { messages?: ChatMsg[]; context?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, cors);
  }
  const messages = (body.messages ?? []).filter(
    (m) => m && (m.role === 'user' || m.role === 'assistant') && (typeof m.content === 'string' || Array.isArray(m.content)),
  );
  if (messages.length === 0) return json({ error: 'Missing "messages"' }, 400, cors);

  const res = await callAnthropic(env, {
    model: CHAT_MODEL,
    max_tokens: 1024,
    system: COACH_SYSTEM + contextBlock(body.context),
    messages,
    tools: [LOG_MEAL_TOOL],
  });
  if (!res.ok) return json({ error: 'Upstream error', detail: res.detail }, 502, cors);

  const data = res.data;
  if (data.stop_reason === 'tool_use') {
    const block = (data.content ?? []).find((c) => c.type === 'tool_use');
    if (block) {
      return json(
        {
          type: 'tool_use',
          tool_use_id: block.id,
          name: block.name,
          input: block.input,
          assistant_content: data.content, // à ré-émettre tel quel côté app
        },
        200,
        cors,
      );
    }
  }
  return json({ type: 'text', reply: textOf(data) }, 200, cors);
}

// ---------- Anthropic ----------

interface AnthropicPayload {
  model: string;
  max_tokens: number;
  system: string;
  messages: unknown[];
  tools?: unknown[];
}

interface AnthropicData {
  stop_reason?: string;
  content?: { type: string; text?: string; id?: string; name?: string; input?: unknown }[];
}

async function callAnthropic(env: Env, payload: AnthropicPayload): Promise<{ ok: true; data: AnthropicData } | { ok: false; detail: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, detail: await res.text() };
  return { ok: true, data: (await res.json()) as AnthropicData };
}

function textOf(data: AnthropicData): string {
  return (data.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('')
    .trim();
}

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
