const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

const builder = new SlashCommandBuilder()
  .setName("aide")
  .setDescription("Liste les commandes du bot eBay Dropship Copilot");

module.exports = {
  data: builder,
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("eBay Dropship Copilot — Commandes")
      .setColor(0x0b5fff)
      .setDescription("Assistant hors-ligne pour vendeurs eBay.fr en dropshipping. Aucune donnée n'est envoyée à eBay/AliExpress/Amazon : tout est calculé localement par le bot.")
      .addFields(
        { name: "/audit", value: "Audite une annonce avant publication (titre, description, livraison, GPSR, VeRO...) et renvoie un score /100 avec les corrections à apporter." },
        { name: "/titre", value: "Génère 3 titres d'annonce optimisés (≤80 caractères) à partir des infos produit." },
        { name: "/description", value: "Génère titres + une description HTML pro (fichier .html joint) prête à coller dans eBay." },
        { name: "/marge", value: "Calcule la marge nette réelle après frais eBay (particulier ou professionnel)." },
        { name: "/niche", value: "Évalue la viabilité d'une niche produit (tendance, concurrence, poids, marge...)." },
        { name: "/guide", value: "Affiche un résumé pratique : politique dropshipping eBay, AliExpress/Amazon, GPSR, VeRO, TVA/IOSS, indicateurs de performance." }
      )
      .setFooter({ text: "Vérifiez toujours les pages officielles eBay avant de publier une annonce sensible." });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
