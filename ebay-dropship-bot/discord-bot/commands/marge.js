const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");

const Sourcing = require(path.join(__dirname, "..", "..", "js", "sourcing.js"));

const VERDICT_COLOR = { ok: 0x1a8754, warn: 0xb8790a, bad: 0xc62828 };

const builder = new SlashCommandBuilder()
  .setName("marge")
  .setDescription("Calcule la marge nette réelle après frais eBay")
  .addStringOption(o => o.setName("compte").setDescription("Type de compte eBay").setRequired(true)
    .addChoices({ name: "Particulier", value: "particulier" }, { name: "Professionnel", value: "professionnel" }))
  .addNumberOption(o => o.setName("prix_vente").setDescription("Prix de vente (€)").setRequired(true).setMinValue(0))
  .addNumberOption(o => o.setName("cout_produit").setDescription("Coût produit fournisseur (€)").setRequired(true).setMinValue(0))
  .addNumberOption(o => o.setName("port_fournisseur").setDescription("Port fournisseur → vous/client (€)").setMinValue(0))
  .addNumberOption(o => o.setName("frais_port_factures").setDescription("Frais de port facturés à l'acheteur (€)").setMinValue(0))
  .addNumberOption(o => o.setName("taux_pro").setDescription("Taux de commission pro en % (si compte professionnel, ex: 10)").setMinValue(5).setMaxValue(12))
  .addNumberOption(o => o.setName("budget_pub_pct").setDescription("Budget pub estimé en % du CA (ex: 10)").setMinValue(0))
  .addNumberOption(o => o.setName("frais_divers_pct").setDescription("Frais divers / provision retours en % du CA (ex: 5)").setMinValue(0));

module.exports = {
  data: builder,
  async execute(interaction) {
    const input = {
      accountType: interaction.options.getString("compte"),
      sellPrice: interaction.options.getNumber("prix_vente"),
      productCost: interaction.options.getNumber("cout_produit"),
      supplierShipping: interaction.options.getNumber("port_fournisseur") || 0,
      shippingCharged: interaction.options.getNumber("frais_port_factures") || 0,
      proRate: interaction.options.getNumber("taux_pro"),
      adSpendPct: interaction.options.getNumber("budget_pub_pct") || 0,
      miscPct: interaction.options.getNumber("frais_divers_pct") || 0
    };

    const r = Sourcing.margin(input);

    const embed = new EmbedBuilder()
      .setTitle(`Marge nette : ${r.netMarginPct.toFixed(1)}% (${r.netMargin.toFixed(2)} €)`)
      .setColor(VERDICT_COLOR[r.verdict.cls])
      .setDescription(`**${r.verdict.label}**`)
      .addFields(
        { name: "Chiffre d'affaires total", value: `${r.totalRevenue.toFixed(2)} €`, inline: true },
        { name: "Frais eBay estimés", value: `${r.ebayFees.toFixed(2)} €`, inline: true },
        { name: "Budget pub", value: `${r.adSpend.toFixed(2)} €`, inline: true },
        { name: "Frais divers / retours", value: `${r.misc.toFixed(2)} €`, inline: true },
        { name: "Coût total (produit + frais)", value: `${r.totalCost.toFixed(2)} €`, inline: true },
        { name: "Marge nette", value: `${r.netMargin.toFixed(2)} €`, inline: true }
      )
      .setFooter({ text: "Astuce : utilisez ce résultat comme argument marge_pct dans /niche" });

    await interaction.reply({ embeds: [embed] });
  }
};
