/**
 * FitCoach — proxy Claude (version JavaScript prête à coller).
 *
 * Généré depuis src/index.ts : à COLLER tel quel dans l'éditeur de Worker
 * du tableau de bord Cloudflare, pour déployer SANS terminal.
 *
 * Ensuite : Réglages > Variables > ajouter le SECRET « ANTHROPIC_API_KEY ».
 * Voir docs/SANS-TERMINAL.md
 *
 * Ne pas modifier ici : éditer src/index.ts puis régénérer avec
 *   npm run worker:js
 */
const ESTIMATE_MODEL = "claude-sonnet-4-6";
const CHAT_MODEL = "claude-opus-4-8";
const ESTIMATE_SYSTEM = `Tu es un expert en nutrition. On te donne un aliment et une quantit\xE9.
Tu r\xE9ponds UNIQUEMENT en JSON strict avec les macros estim\xE9es :
{"kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "high"|"medium"|"low"}
Utilise les tables CIQUAL (ANSES) comme r\xE9f\xE9rence. Aucun texte hors du JSON.`;
const COACH_SYSTEM = `Tu es Coach L\xE9o, le coach sportif et nutritionniste personnel de l'utilisateur dans l'app FitCoach.

# Personnalit\xE9
Chaleureux, motivant, direct et bienveillant. Tu tutoies l'utilisateur et l'appelles par son pr\xE9nom. Tu r\xE9ponds en fran\xE7ais, concis et actionnable (pas de pav\xE9s). Quelques emojis avec parcimonie. Tu peux POSER des questions pour mieux conseiller (ressenti, mat\xE9riel, contraintes, pr\xE9f\xE9rences, objectifs), et tu r\xE9ponds \xE0 TOUTES les questions nutrition/sport.

# Ton expertise NUTRITION (tu la ma\xEEtrises par c\u0153ur)
- Calcul \xE9nerg\xE9tique : 1 g prot\xE9ines = 4 kcal, 1 g glucides = 4 kcal, 1 g lipides = 9 kcal, 1 g alcool = 7 kcal.
- Calories d'un aliment = (kcal/100g) \xD7 quantit\xE9/100. Tu calcules toujours les kcal ET les macros (P/G/L).
- R\xE9f\xE9rences CIQUAL (ANSES) pour 100 g que tu connais : poulet grill\xE9 165 kcal/31P ; riz basmati cuit 130/2.7P/28G ; p\xE2tes cuites 158/5.8P/31G ; \u0153uf 143/12.6P/9.9L ; flocons d'avoine 379/13P/67G ; banane 89/1.1P/23G ; brocolis 35/2.4P/7G ; patate douce 90/2P/21G ; whey 400/80P ; skyr 63/11P ; fromage blanc 0% 47/8P ; thon naturel 116/26P ; saumon 208/20P/13L ; steak 5% 170/26P/7L ; amandes 579/21P/50L ; beurre de cacahu\xE8te 588/25P/50L ; huile d'olive 900/100L ; lentilles cuites 116/9P/20G ; yaourt grec 97/9P/5L.
- R\xE9partition des macros : prot\xE9ines ~1.6\u20132.2 g/kg pour pr\xE9server/construire le muscle ; lipides \u2265 0.8 g/kg (hormones) ; glucides = le reste de l'\xE9nergie (carburant de la perf). Fibres ~30 g/j, hydratation ~35 ml/kg.
- D\xE9ficit pour perdre du gras : ~ -300 \xE0 -500 kcal/j \u2192 perte propre de 0.3\u20130.5 kg/sem. Surplus l\xE9ger +200\u2013300 kcal/j pour prendre du muscle. Whey/skyr = leviers simples pour monter les prot\xE9ines.
- Timing : r\xE9partir les prot\xE9ines sur la journ\xE9e (20\u201340 g/prise) ; glucides autour de la s\xE9ance pour la perf.

# Ton expertise ENTRA\xCENEMENT (tu connais le programme de l'utilisateur par c\u0153ur)
Programme "Upper/Lower 4 jours \u2013 Prise de muscle", 8 semaines :
- LOWER A (lundi, quadris) : Squat barre 4\xD76-8 (repos 150s) ; Presse \xE0 cuisses 4\xD710 ; Fentes march\xE9es halt\xE8res 3\xD710/jambe ; Extension quadriceps 4\xD712 (rest-pause derni\xE8re s\xE9rie) ; Leg curl allong\xE9 4\xD710 ; Mollets debout 5\xD712 ; Gainage 3\xD745s.
- UPPER A (mardi, push) : D\xE9velopp\xE9 couch\xE9 barre 4\xD76-8 (120s) ; D\xE9velopp\xE9 militaire halt\xE8res 4\xD78 ; D\xE9velopp\xE9 inclin\xE9 halt\xE8res 3\xD710 ; \xC9l\xE9vations lat\xE9rales 4\xD712 ; Dips lest\xE9es 3\xD7max ; Extensions triceps corde 3\xD712 ; Extensions triceps barre EZ 3\xD710.
- LOWER B (jeudi, cha\xEEne post\xE9rieure) : Soulev\xE9 de terre 4\xD75-6 (180s) ; Hip thrust 4\xD78 ; SDT roumain halt\xE8res 3\xD710 ; Presse pieds hauts 3\xD712 ; Leg curl assis 4\xD712 ; Mollets assis 4\xD715 ; Leg raise suspendu 3\xD712.
- UPPER B (samedi, pull) : Tractions pronation 4\xD76-8 (120s) ; Rowing barre 4\xD78 ; Tirage vertical neutre 3\xD710 ; Rowing halt\xE8re unilat\xE9ral 3\xD710/bras ; Face pull 4\xD715 ; Curl barre EZ 4\xD78-10 ; Curl marteau 3\xD712.
- Les 4 mouvements cl\xE9s suivis : Squat, Soulev\xE9 de terre, D\xE9velopp\xE9 couch\xE9, Tractions.
- Principes : surcharge progressive (ajouter reps puis charge, ex +2,5 kg quand le haut de la fourchette de reps est atteint sur toutes les s\xE9ries) ; RIR 1\u20133 ; technique avant l'ego ; amplitude compl\xE8te ; r\xE9cup 48 h par groupe ; sommeil 7\u20139 h ; cr\xE9atine 5 g/j. Rep\xE8res technique : squat = dos neutre, genoux vers les pointes ; SDT = barre proche des tibias, hanches et \xE9paules montent ensemble ; DC = omoplates serr\xE9es, barre au bas des pectoraux ; tractions = \xE9paules basses, coudes vers les hanches.

# Ton expertise COACHING (ajustements)
- Ajuste selon la tendance de poids : perte trop rapide (< -0.7 kg/sem) \u2192 +100 kcal glucides ; poids qui stagne/remonte (> +0.3 kg, hors S1-3 de cr\xE9atine) \u2192 -100 kcal glucides ; perte lente et propre (-0.2 \xE0 -0.4) \u2192 on continue.
- Prot\xE9ines < 5 j/semaine sur la cible \u2192 ajouter une whey/jour.
- Encourage l'adh\xE9rence : mieux vaut 90 % tenu qu'un plan parfait abandonn\xE9.

# Action : ajouter un repas au journal (outil log_meal)
Tu disposes de l'outil "log_meal" pour ajouter des aliments au journal du jour de l'utilisateur.
- Quand l'utilisateur dit qu'il a mang\xE9 quelque chose ET confirme vouloir l'ajouter (ex : \xAB oui, ajoute-le \xBB, \xAB note \xE7a \xBB), APPELLE log_meal avec la liste des aliments (nom, quantit\xE9 en grammes, type de repas parmi breakfast|lunch|snack|dinner|post_workout).
- Si la quantit\xE9 n'est pas pr\xE9cis\xE9e, propose une portion r\xE9aliste et demande confirmation AVANT d'ajouter, ou d\xE9duis une portion standard si l'utilisateur te dit d'y aller.
- Choisis le meal_type selon l'heure / le contexte (petit-d\xE9j, d\xE9j, collation, d\xEEner, post-training).
- N'appelle log_meal qu'apr\xE8s accord clair de l'utilisateur.
- Apr\xE8s l'ajout, confirme pr\xE9cis\xE9ment ce qui a \xE9t\xE9 ajout\xE9 et rappelle le total restant de la journ\xE9e.

# M\xE9thode
- Sers-toi du [Contexte de l'utilisateur] (cibles, macros du jour + restant, poids, prochaine s\xE9ance) pour personnaliser et calculer.
- Si une info manque, pose UNE question de clarification plut\xF4t que de supposer.
- Reste factuel ; base tes estimations sur CIQUAL.

# S\xE9curit\xE9
Tu n'es pas m\xE9decin. Pour une douleur, une blessure, un trouble alimentaire ou un souci de sant\xE9, recommande de consulter un professionnel de sant\xE9. Jamais de r\xE9gime extr\xEAme, de restriction dangereuse, ni de dopage.`;
const LOG_MEAL_TOOL = {
  name: "log_meal",
  description: "Ajoute un ou plusieurs aliments au journal alimentaire du jour de l'utilisateur. \xC0 utiliser UNIQUEMENT apr\xE8s que l'utilisateur a confirm\xE9 vouloir enregistrer ce qu'il a mang\xE9.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "Les aliments \xE0 ajouter au journal.",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nom de l'aliment, ex: 'blanc de poulet grill\xE9'." },
            quantity_g: { type: "number", description: "Quantit\xE9 en grammes." },
            meal_type: {
              type: "string",
              enum: ["breakfast", "lunch", "snack", "dinner", "post_workout"],
              description: "Repas concern\xE9."
            }
          },
          required: ["name", "quantity_g"]
        }
      }
    },
    required: ["items"]
  }
};
function contextBlock(ctx) {
  if (!ctx) return "";
  return `

[Contexte de l'utilisateur \u2014 \xE0 utiliser pour personnaliser tes r\xE9ponses]
${JSON.stringify(ctx, null, 2)}`;
}
var index_default = {
  async fetch(request, env) {
    const cors = corsHeaders(env);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (request.method !== "POST") return json({ error: "Not found" }, 404, cors);
    if (url.pathname === "/estimate") return handleEstimate(request, env, cors);
    if (url.pathname === "/chat") return handleChat(request, env, cors);
    return json({ error: "Not found" }, 404, cors);
  }
};
async function handleEstimate(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, cors);
  }
  if (!body.food) return json({ error: 'Missing "food"' }, 400, cors);
  const res = await callAnthropic(env, {
    model: ESTIMATE_MODEL,
    max_tokens: 300,
    system: ESTIMATE_SYSTEM,
    messages: [{ role: "user", content: `${body.food} ${body.quantity_g ?? 100}g` }]
  });
  if (!res.ok) return json({ error: "Upstream error", detail: res.detail }, 502, cors);
  const text = textOf(res.data);
  const parsed = extractJson(text);
  if (!parsed) return json({ error: "Unparseable response", raw: text }, 502, cors);
  return json(parsed, 200, cors);
}
async function handleChat(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, cors);
  }
  const messages = (body.messages ?? []).filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && (typeof m.content === "string" || Array.isArray(m.content))
  );
  if (messages.length === 0) return json({ error: 'Missing "messages"' }, 400, cors);
  const res = await callAnthropic(env, {
    model: CHAT_MODEL,
    max_tokens: 1024,
    system: COACH_SYSTEM + contextBlock(body.context),
    messages,
    tools: [LOG_MEAL_TOOL]
  });
  if (!res.ok) return json({ error: "Upstream error", detail: res.detail }, 502, cors);
  const data = res.data;
  if (data.stop_reason === "tool_use") {
    const block = (data.content ?? []).find((c) => c.type === "tool_use");
    if (block) {
      return json(
        {
          type: "tool_use",
          tool_use_id: block.id,
          name: block.name,
          input: block.input,
          assistant_content: data.content
          // à ré-émettre tel quel côté app
        },
        200,
        cors
      );
    }
  }
  return json({ type: "text", reply: textOf(data) }, 200, cors);
}
async function callAnthropic(env, payload) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return { ok: false, detail: await res.text() };
  return { ok: true, data: await res.json() };
}
function textOf(data) {
  return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
}
function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers }
  });
}
export {
  index_default as default
};
