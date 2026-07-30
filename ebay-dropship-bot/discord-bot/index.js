require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, MessageFlags } = require("discord.js");

if (!process.env.DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN manquant. Copiez .env.example en .env et renseignez vos identifiants.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsDir = path.join(__dirname, "commands");
fs.readdirSync(commandsDir)
  .filter(f => f.endsWith(".js"))
  .forEach(file => {
    const command = require(path.join(commandsDir, file));
    if (command && command.data && command.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`Commande ignorée (structure invalide) : ${file}`);
    }
  });

client.once("clientReady", () => {
  console.log(`eBay Dropship Copilot connecté en tant que ${client.user.tag}`);
  console.log(`${client.commands.size} commande(s) chargée(s) : ${[...client.commands.keys()].join(", ")}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Erreur dans la commande /${interaction.commandName} :`, err);
    const payload = { content: "⚠️ Une erreur est survenue lors du traitement de la commande.", flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
