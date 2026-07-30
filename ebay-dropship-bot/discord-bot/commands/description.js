const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");

const RULES = require(path.join(__dirname, "..", "..", "js", "rules.js"));
const Generator = require(path.join(__dirname, "..", "..", "js", "generator.js"));

const SHIP_LABELS = {
  france: "notre entrepôt en France",
  ue: "notre entrepôt en Union Européenne",
  asie: "notre partenaire logistique international"
};

const builder = new SlashCommandBuilder()
  .setName("description")
  .setDescription("Génère une fiche produit complète : titres + description HTML prête à coller dans eBay")
  .addStringOption(o => o.setName("nom").setDescription("Nom du produit").setRequired(true).setMaxLength(100))
  .addStringOption(o => {
    o.setName("categorie").setDescription("Catégorie du produit").setRequired(true);
    RULES.categories.forEach(c => o.addChoices({ name: c, value: c }));
    return o;
  })
  .addStringOption(o => o.setName("marque").setDescription("Marque (optionnel)").setMaxLength(60))
  .addStringOption(o => o.setName("modele").setDescription("Modèle / compatibilité (optionnel)").setMaxLength(80))
  .addStringOption(o => o.setName("couleur").setDescription("Couleur (optionnel)").setMaxLength(40))
  .addStringOption(o => o.setName("matiere").setDescription("Matière (optionnel)").setMaxLength(40))
  .addStringOption(o => {
    o.setName("etat").setDescription("État du produit (optionnel)");
    RULES.conditions.forEach(c => o.addChoices({ name: c.label, value: c.value }));
    return o;
  })
  .addStringOption(o => o.setName("points_forts").setDescription("Points forts séparés par |  (ex: Anti-choc|Léger|Facile à poser)").setMaxLength(500))
  .addStringOption(o => o.setName("contenu_colis").setDescription("Contenu du colis séparé par |  (ex: 1x coque|1x chiffon)").setMaxLength(300))
  .addStringOption(o => o.setName("expedition").setDescription("Expédition depuis (optionnel)")
    .addChoices({ name: "France", value: "france" }, { name: "Union Européenne", value: "ue" }, { name: "International", value: "asie" }))
  .addIntegerOption(o => o.setName("delai").setDescription("Délai de livraison annoncé (jours)").setMinValue(0))
  .addStringOption(o => o.setName("garantie").setDescription("Garantie / service client (optionnel)").setMaxLength(300));

module.exports = {
  data: builder,
  async execute(interaction) {
    const condValue = interaction.options.getString("etat");
    const cond = RULES.conditions.find(c => c.value === condValue);
    const shipFrom = interaction.options.getString("expedition") || "france";

    const data = {
      name: interaction.options.getString("nom"),
      category: interaction.options.getString("categorie"),
      brand: interaction.options.getString("marque") || "",
      model: interaction.options.getString("modele") || "",
      color: interaction.options.getString("couleur") || "",
      material: interaction.options.getString("matiere") || "",
      conditionLabel: cond ? cond.label : "",
      highlights: (interaction.options.getString("points_forts") || "").split("|").map(s => s.trim()).filter(Boolean).join("\n"),
      boxContents: (interaction.options.getString("contenu_colis") || "").split("|").map(s => s.trim()).filter(Boolean).join("\n"),
      shipFromLabel: SHIP_LABELS[shipFrom],
      declaredDelay: interaction.options.getInteger("delai") || "",
      warranty: interaction.options.getString("garantie") || ""
    };

    const result = Generator.generate(data);

    const embed = new EmbedBuilder()
      .setTitle(`Fiche produit générée — ${data.name}`)
      .setColor(0x0b5fff)
      .setDescription(result.titles.map((t, i) => `**Titre ${i + 1}** (${t.length}/80) : ${t}`).join("\n"))
      .addFields({ name: "Item Specifics à renseigner", value: result.specifics.join(", ").slice(0, 1000) })
      .setFooter({ text: "Le fichier joint contient le code HTML prêt à coller dans l'éditeur de description eBay" });

    const attachment = new AttachmentBuilder(Buffer.from(result.descriptionHtml, "utf-8"), { name: "description-ebay.html" });

    await interaction.reply({ embeds: [embed], files: [attachment] });
  }
};
