const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const rankTiers = [
  { name: 'Copper', min: 1000, max: 1499, color: 0x8B4513, image: 'https://trackercdn.com/cdn/r6.tracker.network/ranks/svg/s15/hd-rank5.svg' },
  { name: 'Bronze', min: 1500, max: 1999, color: 0xCD7F32, image: 'https://multiboosting.com/app/plugins/multiboosting-calculator-plugin/public/images/rainbowsix/bronze-v.png' },
  { name: 'Silver', min: 2000, max: 2499, color: 0xC0C0C0, image: 'https://cdn3.emoji.gg/emojis/54401-silver.png' },
  { name: 'Gold', min: 2500, max: 2999, color: 0xFFD700, image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5o6FA0tOweqf2RMm6ly9ET/5cf7d4ce0465315dfa4012a6a84c428a/R6S_RANK_500x500_GOLD_03.png' },
  { name: 'Platinum', min: 3000, max: 3499, color: 0x76E3E3, image: 'https://cdn3.emoji.gg/emojis/93489-rainbowsixsigeplatinum.png' },
  { name: 'Emerald', min: 3500, max: 3999, color: 0x00FF7F, image: 'https://cdn3.emoji.gg/emojis/94972-emerald.png' },
  { name: 'Diamond', min: 4000, max: 4499, color: 0xBB72EC, image: 'https://res.cloudinary.com/dv0epbifo/image/upload/v1698687347/guessmyrank_2023-10-30_23_03/rainbow6siege/diamond-min_epcnbm_qttyfm.png' },
  { name: 'Champion', min: 4500, max: Infinity, color: 0xFF1493, image: 'https://tiermaker.com/images/templates/y8s3-r6-tier-list-16019296/160192961691966922.webp' }
];

function getRankFromRP(rankPoints) {
  const tier = rankTiers.find(r => rankPoints >= r.min && rankPoints <= r.max);
  if (!tier) return { name: 'Unranked', color: 0x808080, image: null };
  if (tier.name === 'Champion') return { name: 'Champion', color: tier.color, image: tier.image };
  const tierProgress = rankPoints - tier.min;
  let subTierNumber = 5 - Math.floor(tierProgress / 100);
  if (subTierNumber < 1) subTierNumber = 1;
  if (subTierNumber > 5) subTierNumber = 5;
  return { name: `${tier.name} ${subTierNumber}`, color: tier.color, image: tier.image };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('r6stats')
    .setDescription('Look up a user\'s Rainbow Six Siege Ranked stats')
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Select platform')
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
    const platform = interaction.options.getString('platform');
    const username = interaction.options.getString('username');
    const apiUrl = `http://localhost:3000/r6/${platform}/${encodeURIComponent(username)}`;

    try {
      const { data } = await axios.get(apiUrl);
      if (!data.ranked) return interaction.reply({ content: 'No ranked stats found.', ephemeral: true });

      const rankInfo = getRankFromRP(data.ranked.rankPoints);
      const embed = new EmbedBuilder()
        .setTitle(`${data.username} - ${platform.toUpperCase()} R6 Stats`)
        .setColor(rankInfo.color)
        .setThumbnail(rankInfo.image)
        .addFields(
          { name: 'Rank', value: `${data.ranked.rankPoints} RP (${rankInfo.name})`, inline: true },
          { name: 'Wins', value: `${data.ranked.wins}`, inline: true },
          { name: 'Losses', value: `${data.ranked.losses}`, inline: true },
          { name: 'Kills', value: `${data.ranked.kills}`, inline: true },
          { name: 'Deaths', value: `${data.ranked.deaths}`, inline: true },
          { name: 'KD', value: data.ranked.kd >= 1 ? `🟢 ${data.ranked.kd}` : `🔴 ${data.ranked.kd}`, inline: true },
          { name: 'Matches Played', value: `${data.ranked.matchesPlayed}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not fetch stats. Check username/platform.', ephemeral: true });
    }
  }
};
