const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// R6 rank tiers with RP starting at 1000
const rankTiers = [
  { name: 'Copper', min: 1000, max: 1499, color: 0x8B4513 },
  { name: 'Bronze', min: 1500, max: 1999, color: 0xCD7F32 },
  { name: 'Silver', min: 2000, max: 2499, color: 0xC0C0C0 },
  { name: 'Gold', min: 2500, max: 2999, color: 0xFFD700 },
  { name: 'Platinum', min: 3000, max: 3499, color: 0x00BFFF },
  { name: 'Emerald', min: 3500, max: 3999, color: 0x00FF7F },
  { name: 'Diamond', min: 4000, max: 4499, color: 0xBB72EC },
  { name: 'Champion', min: 4500, max: Infinity, color: 0xFF1493 } // single tier
];

// Convert rankPoints to rank name + sub-tier
function getRankFromRP(rankPoints) {
  const tier = rankTiers.find(r => rankPoints >= r.min && rankPoints <= r.max);

  if (!tier) return { name: 'Unranked', color: 0x808080 };

  // Champion has no sub-tier
  if (tier.name === 'Champion') return { name: 'Champion', color: tier.color };

  const tierProgress = rankPoints - tier.min;
  let subTierNumber = 5 - Math.floor(tierProgress / 100);

  if (subTierNumber < 1) subTierNumber = 1;
  if (subTierNumber > 5) subTierNumber = 5;

  return { name: `${tier.name} ${subTierNumber}`, color: tier.color };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('r6')
    .setDescription('Look up a user\'s Rainbow Six Siege Ranked stats')
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Select the platform')
        .setRequired(true)
        .addChoices(
          { name: 'PC', value: 'pc' },
          { name: 'Xbox', value: 'xbox' },
          { name: 'PlayStation', value: 'psn' }
        ))
    .addStringOption(option =>
      option.setName('username')
        .setDescription('R6 username')
        .setRequired(true)),
  async execute(interaction) {
    const platform = interaction.options.getString('platform'); // guaranteed valid choice
    const username = interaction.options.getString('username');

    const apiUrl = `http://localhost:3000/r6/${encodeURIComponent(platform)}/${encodeURIComponent(username)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (!data.ranked) {
        return interaction.reply({ content: 'No ranked stats found for this player.', ephemeral: true });
      }

      const ranked = data.ranked;
      const rankInfo = getRankFromRP(ranked.rankPoints);

      const embed = new EmbedBuilder()
        .setTitle(`${data.username} - ${data.platform.toUpperCase()} Ranked Stats`)
        .setColor(rankInfo.color)
        .addFields(
          { name: 'Rank', value: `${ranked.rankPoints} RP (${rankInfo.name})`, inline: true },
          { name: 'Wins', value: `${ranked.wins}`, inline: true },
          { name: 'Losses', value: `${ranked.losses}`, inline: true },
          { name: 'Kills', value: `${ranked.kills}`, inline: true },
          { name: 'Deaths', value: `${ranked.deaths}`, inline: true },
          { name: 'KD', value: ranked.kd >= 1 ? `${ranked.kd}` : `${ranked.kd}`, inline: true },
          { name: 'Matches Played', value: `${ranked.matchesPlayed}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error fetching R6 stats:`, error.message);
      await interaction.reply({ content: 'Could not fetch stats. Make sure the username and platform are correct.', ephemeral: true });
    }
  }
};
