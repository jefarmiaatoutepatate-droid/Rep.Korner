const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");

const RULES = require(path.join(__dirname, "..", "..", "js", "rules.js"));

const builder = new SlashCommandBuilder()
  .setName("guide")
  .setDescription("Affiche un résumé de la base de connaissances dropshipping / eBay.fr")
  .addStringOption(o => {
    o.setName("sujet").setDescription("Sujet à afficher").setRequired(true);
    RULES.knowledgeBase.forEach(item => o.addChoices({ name: item.title, value: item.id }));
    return o;
  });

module.exports = {
  data: builder,
  async execute(interaction) {
    const id = interaction.options.getString("sujet");
    const item = RULES.knowledgeBase.find(k => k.id === id);
    if (!item) {
      await interaction.reply({ content: "Sujet introuvable.", ephemeral: true });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(item.title)
      .setColor(0x0b5fff)
      .setDescription(item.body.slice(0, 4000))
      .setFooter({ text: `Dernière relecture : ${RULES.meta.lastReviewed} • ${RULES.meta.disclaimer}`.slice(0, 2048) });

    await interaction.reply({ embeds: [embed] });
  }
};
