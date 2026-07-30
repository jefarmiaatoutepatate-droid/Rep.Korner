const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");

const RULES = require(path.join(__dirname, "..", "..", "js", "rules.js"));
const Generator = require(path.join(__dirname, "..", "..", "js", "generator.js"));

const builder = new SlashCommandBuilder()
  .setName("titre")
  .setDescription("Génère 3 titres d'annonce optimisés (≤80 caractères)")
  .addStringOption(o => o.setName("nom").setDescription("Nom du produit").setRequired(true).setMaxLength(100))
  .addStringOption(o => o.setName("marque").setDescription("Marque (optionnel)").setMaxLength(60))
  .addStringOption(o => o.setName("modele").setDescription("Modèle / compatibilité (optionnel)").setMaxLength(80))
  .addStringOption(o => o.setName("couleur").setDescription("Couleur (optionnel)").setMaxLength(40))
  .addStringOption(o => o.setName("matiere").setDescription("Matière (optionnel)").setMaxLength(40))
  .addStringOption(o => {
    o.setName("etat").setDescription("État du produit (optionnel)");
    RULES.conditions.forEach(c => o.addChoices({ name: c.label, value: c.value }));
    return o;
  });

module.exports = {
  data: builder,
  async execute(interaction) {
    const condValue = interaction.options.getString("etat");
    const cond = RULES.conditions.find(c => c.value === condValue);

    const data = {
      name: interaction.options.getString("nom"),
      brand: interaction.options.getString("marque") || "",
      model: interaction.options.getString("modele") || "",
      color: interaction.options.getString("couleur") || "",
      material: interaction.options.getString("matiere") || "",
      conditionLabel: cond ? cond.label : ""
    };

    const result = Generator.generate(data);

    const embed = new EmbedBuilder()
      .setTitle(`Titres suggérés pour « ${data.name} »`)
      .setColor(0x0b5fff)
      .setDescription(
        result.titles.map((t, i) => `**${i + 1}.** ${t}\n_${t.length}/80 caractères_`).join("\n\n")
      )
      .setFooter({ text: "Astuce : utilisez /description pour générer la fiche complète" });

    await interaction.reply({ embeds: [embed] });
  }
};
