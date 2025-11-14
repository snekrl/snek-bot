const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const rlRanks = [
  { name: 'Bronze', min: 0, max: 599, color: 0xCD7F32, image: 'bronze.png' },
  { name: 'Silver', min: 600, max: 1199, color: 0xC0C0C0, image: 'silver.png' },
  { name: 'Gold', min: 1200, max: 1799, color: 0xFFD700, image: 'gold.png' },
  { name: 'Platinum', min: 1800, max: 2399, color: 0x00BFFF, image: 'platinum.png' },
  { name: 'Diamond', min: 2400, max: 2999, color: 0xBB72EC, image: 'diamond.png' },
  { name: 'Champion', min: 3000, max: 3599, color: 0xFF1493, image: 'champion.png' },
  { name: 'Grand Champion', min: 3600, max: 4199, color: 0xFF4500, image: 'grandchamp.png' },
  { name: 'Supersonic Legend', min: 4200, max: Infinity, color: 0x00FFFF, image: 'ssl.png' }
];

function getRLRank(rp) {
  return rlRanks.find(r => rp >= r.min && rp <= r.max) || { name: 'Unranked', color: 0x808080, image: null };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rl')
    .setDescription('Look up a user\'s Rocket League stats')
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Select platform')
        .setRequired(true)
        .addChoices(
          { name: 'PC', value: 'steam' },
          { name: 'Xbox', value: 'xbox' },
          { name: 'PlayStation', value: 'psn' }
        ))
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Rocket League username')
        .setRequired(true)),
  async execute(interaction) {
    const platform = interaction.options.getString('platform');
    const username = interaction.options.getString('username');
    const apiUrl = `http://localhost:3000/rl/${platform}/${encodeURIComponent(username)}`;

    try {
      const { data } = await axios.get(apiUrl);
      const rankInfo = getRLRank(data.rankPoints);

      const embed = new EmbedBuilder()
        .setTitle(`${data.username} - ${platform.toUpperCase()} RL Stats`)
        .setColor(rankInfo.color)
        .setThumbnail(rankInfo.image)
        .addFields(
          { name: 'Rank', value: `${data.rankPoints} RP (${rankInfo.name})`, inline: true },
          { name: 'Wins', value: `${data.wins}`, inline: true },
          { name: 'Losses', value: `${data.losses}`, inline: true },
          { name: 'Matches Played', value: `${data.matchesPlayed}`, inline: true },
          { name: 'Goals', value: `${data.goals}`, inline: true },
          { name: 'Assists', value: `${data.assists}`, inline: true },
          { name: 'Saves', value: `${data.saves}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not fetch RL stats. Check username/platform.', ephemeral: true });
    }
  }
};
