require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error("DISCORD_TOKEN et DISCORD_CLIENT_ID sont requis. Copiez .env.example en .env et renseignez vos identifiants.");
  process.exit(1);
}

const commandsDir = path.join(__dirname, "commands");
const commands = fs.readdirSync(commandsDir)
  .filter(f => f.endsWith(".js"))
  .map(file => require(path.join(commandsDir, file)).data.toJSON());

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    const target = DISCORD_GUILD_ID
      ? Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)
      : Routes.applicationCommands(DISCORD_CLIENT_ID);

    console.log(`Déploiement de ${commands.length} commande(s) ${DISCORD_GUILD_ID ? `sur le serveur ${DISCORD_GUILD_ID} (instantané)` : "en global (propagation ~1h)"}...`);

    const data = await rest.put(target, { body: commands });

    console.log(`✅ ${data.length} commande(s) déployée(s) : ${data.map(c => c.name).join(", ")}`);
  } catch (err) {
    console.error("Échec du déploiement des commandes :", err);
    process.exit(1);
  }
})();
