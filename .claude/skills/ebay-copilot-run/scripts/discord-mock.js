/* ==========================================================================
   discord-mock.js — Harnais réutilisable pour tester les commandes du bot
   Discord (ebay-dropship-bot/discord-bot/commands/*.js) SANS token réel et
   sans connexion au gateway Discord. Simule interaction.options.getX() et
   interaction.reply()/.followUp(), puis vérifie les limites Discord
   (longueur titre/description/champs d'embed).

   Utilisable en ligne de commande :
     node discord-mock.js <chemin-commande.js> '<json-des-options>'
   ou comme module :
     const { testCommand } = require("./discord-mock.js");
   ========================================================================== */

const DISCORD_LIMITS = {
  embedTitle: 256,
  embedDescription: 4096,
  fieldName: 256,
  fieldValue: 1024,
  maxFields: 25
};

function makeInteraction(values) {
  const replies = [];
  return {
    options: {
      getString: (name) => (name in values ? values[name] : null),
      getInteger: (name) => (name in values ? values[name] : null),
      getNumber: (name) => (name in values ? values[name] : null),
      getBoolean: (name) => (name in values ? values[name] : null)
    },
    replied: false,
    deferred: false,
    reply: async (payload) => { replies.push(payload); return payload; },
    followUp: async (payload) => { replies.push(payload); return payload; },
    _replies: replies
  };
}

function checkEmbedLimits(embedJson, issues) {
  if (embedJson.title && embedJson.title.length > DISCORD_LIMITS.embedTitle) {
    issues.push(`titre d'embed trop long (${embedJson.title.length}/${DISCORD_LIMITS.embedTitle})`);
  }
  if (embedJson.description && embedJson.description.length > DISCORD_LIMITS.embedDescription) {
    issues.push(`description d'embed trop longue (${embedJson.description.length}/${DISCORD_LIMITS.embedDescription})`);
  }
  if (embedJson.fields) {
    if (embedJson.fields.length > DISCORD_LIMITS.maxFields) {
      issues.push(`trop de champs (${embedJson.fields.length}/${DISCORD_LIMITS.maxFields})`);
    }
    embedJson.fields.forEach((f, i) => {
      if (f.name.length > DISCORD_LIMITS.fieldName) issues.push(`champ #${i} : nom trop long (${f.name.length}/${DISCORD_LIMITS.fieldName})`);
      if (f.value.length > DISCORD_LIMITS.fieldValue) issues.push(`champ #${i} : valeur trop longue (${f.value.length}/${DISCORD_LIMITS.fieldValue})`);
    });
  }
}

/**
 * Charge une commande, valide sa définition (SlashCommandBuilder.toJSON())
 * puis exécute .execute() avec des options simulées.
 * @param {string} commandPath - chemin absolu vers le fichier de commande
 * @param {object} values - valeurs simulées pour interaction.options.getX(name)
 * @returns {{ ok: boolean, issues: string[], json: object, replies: object[] }}
 */
async function testCommand(commandPath, values) {
  delete require.cache[require.resolve(commandPath)];
  const cmd = require(commandPath);
  const issues = [];

  if (!cmd || !cmd.data || typeof cmd.execute !== "function") {
    return { ok: false, issues: ["structure invalide : il manque `data` (SlashCommandBuilder) ou `execute()`"], json: null, replies: [] };
  }

  let json;
  try {
    json = cmd.data.toJSON();
  } catch (e) {
    return { ok: false, issues: [`data.toJSON() a levé une erreur : ${e.message}`], json: null, replies: [] };
  }

  const interaction = makeInteraction(values || {});
  try {
    await cmd.execute(interaction);
  } catch (e) {
    return { ok: false, issues: [`execute() a levé une erreur : ${e.stack || e.message}`], json, replies: interaction._replies };
  }

  if (interaction._replies.length === 0) {
    issues.push("execute() ne semble avoir appelé ni reply() ni followUp()");
  }
  interaction._replies.forEach(reply => {
    (reply.embeds || []).forEach(embed => {
      const embedJson = typeof embed.toJSON === "function" ? embed.toJSON() : embed;
      checkEmbedLimits(embedJson, issues);
    });
  });

  return { ok: issues.length === 0, issues, json, replies: interaction._replies };
}

module.exports = { makeInteraction, testCommand, checkEmbedLimits, DISCORD_LIMITS };

if (require.main === module) {
  const [, , commandPath, valuesJson] = process.argv;
  if (!commandPath) {
    console.error("Usage: node discord-mock.js <chemin-commande.js> '<json-des-options>'");
    process.exit(1);
  }
  const values = valuesJson ? JSON.parse(valuesJson) : {};
  testCommand(require("path").resolve(commandPath), values).then(result => {
    console.log(JSON.stringify(result, (k, v) => (k === "replies" ? undefined : v), 2));
    if (result.replies) {
      result.replies.forEach((r, i) => {
        console.log(`--- reply #${i} ---`);
        if (r.embeds) r.embeds.forEach(e => console.log(JSON.stringify(e.toJSON ? e.toJSON() : e, null, 2)));
        if (r.files) console.log("fichiers joints :", r.files.map(f => f.name).join(", "));
        if (r.content) console.log("content :", r.content);
      });
    }
    if (!result.ok) {
      console.error("ÉCHEC :", result.issues.join(" | "));
      process.exit(1);
    }
    console.log("OK");
  });
}
