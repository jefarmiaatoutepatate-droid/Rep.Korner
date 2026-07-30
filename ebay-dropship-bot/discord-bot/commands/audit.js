const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");

const RULES = require(path.join(__dirname, "..", "..", "js", "rules.js"));
const Audit = require(path.join(__dirname, "..", "..", "js", "audit.js"));

const SEVERITY_EMOJI = { bloquant: "🔴", avertissement: "🟠", info: "🟢" };
const VERDICT_COLOR = { ok: 0x1a8754, warn: 0xb8790a, bad: 0xc62828 };

const builder = new SlashCommandBuilder()
  .setName("audit")
  .setDescription("Audite une annonce eBay avant publication (titre, description, livraison, GPSR...)")
  .addStringOption(o => o.setName("titre").setDescription("Titre prévu de l'annonce").setRequired(true).setMaxLength(200))
  .addStringOption(o => o.setName("description").setDescription("Description complète prévue").setRequired(true).setMaxLength(4000))
  .addStringOption(o => {
    o.setName("categorie").setDescription("Catégorie du produit").setRequired(true);
    RULES.categories.forEach(c => o.addChoices({ name: c, value: c }));
    return o;
  })
  .addIntegerOption(o => o.setName("photos").setDescription("Nombre de photos").setRequired(true).setMinValue(0))
  .addStringOption(o => o.setName("retours").setDescription("Politique de retour").setRequired(true)
    .addChoices({ name: "30 jours", value: "30j" }, { name: "60 jours", value: "60j" }, { name: "Non acceptés", value: "non" }))
  .addStringOption(o => o.setName("expedition").setDescription("Expédition depuis").setRequired(true)
    .addChoices({ name: "France", value: "france" }, { name: "Union Européenne", value: "ue" }, { name: "Asie (direct fournisseur)", value: "asie" }))
  .addIntegerOption(o => o.setName("delai_annonce").setDescription("Délai de livraison annoncé au client (jours)").setRequired(true).setMinValue(0))
  .addIntegerOption(o => o.setName("delai_fournisseur").setDescription("Délai réel du fournisseur (jours)").setRequired(true).setMinValue(0))
  .addStringOption(o => o.setName("marque").setDescription("Marque mentionnée (optionnel, vérif VeRO)").setMaxLength(60))
  .addBooleanOption(o => o.setName("photos_hd").setDescription("Photos ≥ 1600px de large ?"))
  .addIntegerOption(o => o.setName("specifics_remplis").setDescription("Nombre d'Item Specifics remplis").setMinValue(0))
  .addIntegerOption(o => o.setName("specifics_total").setDescription("Nombre d'Item Specifics recommandés au total").setMinValue(0))
  .addBooleanOption(o => o.setName("gpsr_fabricant").setDescription("Coordonnées fabricant renseignées ? (catégories GPSR)"))
  .addBooleanOption(o => o.setName("gpsr_responsable").setDescription("Personne responsable UE renseignée ? (catégories GPSR)"))
  .addBooleanOption(o => o.setName("gpsr_avertissements").setDescription("Avertissements de sécurité renseignés ? (catégories GPSR)"));

module.exports = {
  data: builder,
  async execute(interaction) {
    const data = {
      title: interaction.options.getString("titre"),
      description: interaction.options.getString("description"),
      category: interaction.options.getString("categorie"),
      brand: interaction.options.getString("marque") || "",
      photoCount: interaction.options.getInteger("photos"),
      photoHighRes: interaction.options.getBoolean("photos_hd") || false,
      returns: interaction.options.getString("retours"),
      shipFrom: interaction.options.getString("expedition"),
      declaredDelay: interaction.options.getInteger("delai_annonce"),
      supplierDelay: interaction.options.getInteger("delai_fournisseur"),
      specificsFilled: interaction.options.getInteger("specifics_remplis") || 0,
      specificsTotal: interaction.options.getInteger("specifics_total") || 0,
      gpsrManufacturer: interaction.options.getBoolean("gpsr_fabricant") || false,
      gpsrResponsible: interaction.options.getBoolean("gpsr_responsable") || false,
      gpsrWarnings: interaction.options.getBoolean("gpsr_avertissements") || false
    };

    const result = Audit.run(data);

    const embed = new EmbedBuilder()
      .setTitle(`Audit d'annonce — ${result.score}/100`)
      .setColor(VERDICT_COLOR[result.verdict.cls])
      .setDescription(`**${result.verdict.label}**\n${data.title}`.slice(0, 4000))
      .setFooter({ text: "eBay Dropship Copilot • vérifiez toujours les pages officielles eBay avant publication" });

    const shown = result.findings.slice(0, 24);
    shown.forEach(f => {
      embed.addFields({
        name: `${SEVERITY_EMOJI[f.severity]} ${f.severity.toUpperCase()} — ${f.title}`.slice(0, 256),
        value: f.detail.slice(0, 1000)
      });
    });
    if (result.findings.length > shown.length) {
      embed.addFields({ name: "…", value: `${result.findings.length - shown.length} résultat(s) supplémentaire(s) non affiché(s).` });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
