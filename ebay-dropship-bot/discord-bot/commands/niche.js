const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");

const Sourcing = require(path.join(__dirname, "..", "..", "js", "sourcing.js"));

const VERDICT_COLOR = { ok: 0x1a8754, warn: 0xb8790a, bad: 0xc62828 };
const OUI_NON = [{ name: "Oui", value: "oui" }, { name: "Non", value: "non" }];

const builder = new SlashCommandBuilder()
  .setName("niche")
  .setDescription("Évalue la viabilité d'une niche produit en dropshipping")
  .addStringOption(o => o.setName("tendance").setDescription("Tendance (Google Trends / TikTok)").setRequired(true)
    .addChoices(
      { name: "En baisse", value: "baisse" }, { name: "Stable", value: "stable" },
      { name: "En croissance", value: "croissance" }, { name: "Virale", value: "virale" }
    ))
  .addStringOption(o => o.setName("concurrence").setDescription("Concurrence sur eBay").setRequired(true)
    .addChoices({ name: "Saturée", value: "saturee" }, { name: "Modérée", value: "moderee" }, { name: "Faible", value: "faible" }))
  .addStringOption(o => o.setName("poids").setDescription("Poids / encombrement").setRequired(true)
    .addChoices({ name: "Léger (< 2kg)", value: "leger" }, { name: "Moyen", value: "moyen" }, { name: "Lourd (> 5kg)", value: "lourd" }))
  .addNumberOption(o => o.setName("prix_vente").setDescription("Prix de vente envisagé (€)").setRequired(true).setMinValue(0))
  .addStringOption(o => o.setName("resout_probleme").setDescription("Résout un problème concret / effet wow ?").addChoices(...OUI_NON))
  .addStringOption(o => o.setName("trouvable_localement").setDescription("Facile à trouver en magasin local ?").addChoices(...OUI_NON))
  .addStringOption(o => o.setName("risque_legal").setDescription("Risque légal / restriction eBay identifié ?").addChoices(...OUI_NON))
  .addStringOption(o => o.setName("fournisseur_fiable").setDescription("Fournisseur jugé fiable (≥4.7★, historique solide) ?").addChoices(...OUI_NON))
  .addNumberOption(o => o.setName("marge_pct").setDescription("Marge nette calculée en % (voir /marge, optionnel)"));

module.exports = {
  data: builder,
  async execute(interaction) {
    const input = {
      trend: interaction.options.getString("tendance"),
      competition: interaction.options.getString("concurrence"),
      weight: interaction.options.getString("poids"),
      sellPrice: interaction.options.getNumber("prix_vente"),
      solvesProblem: interaction.options.getString("resout_probleme") || "non",
      easilyFoundLocally: interaction.options.getString("trouvable_localement") || "non",
      legalRisk: interaction.options.getString("risque_legal") || "non",
      reliableSupplier: interaction.options.getString("fournisseur_fiable") || "non",
      marginPct: interaction.options.getNumber("marge_pct")
    };

    const r = Sourcing.nicheScore(input);

    const embed = new EmbedBuilder()
      .setTitle(`Score de niche : ${r.score}/100`)
      .setColor(VERDICT_COLOR[r.verdict.cls])
      .setDescription(`**${r.verdict.label}**\n\n${r.notes.map(n => `• ${n}`).join("\n")}`)
      .setFooter({ text: "eBay Dropship Copilot • aide à la décision, pas une garantie de succès" });

    await interaction.reply({ embeds: [embed] });
  }
};
