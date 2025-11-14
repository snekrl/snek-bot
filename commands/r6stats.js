const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('r6')
    .setDescription('Fetch Rainbow Six Siege stats (Ranked + Casual)')
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('PC, Xbox, or PSN')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('username')
        .setDescription('R6 username')
        .setRequired(true)),
  async execute(interaction) {
    const platform = interaction.options.getString('platform').toLowerCase();
    const username = interaction.options.getString('username');

    const apiUrl = `http://localhost:3000/r6/${encodeURIComponent(platform)}/${encodeURIComponent(username)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (!data.ranked && !data.standard) {
        return interaction.reply({ content: 'No stats found for this player.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${data.username} - ${data.platform.toUpperCase()} Stats`)
        .setColor(0x1F8B4C);

      // Add Ranked stats if available
      if (data.ranked) {
        embed.addFields(
          { name: '--- Ranked ---', value: '\u200B' },
          { name: 'Rank', value: `${data.ranked.rank} (${data.ranked.rankPoints} pts)`, inline: true },
          { name: 'Wins', value: `${data.ranked.wins}`, inline: true },
          { name: 'Losses', value: `${data.ranked.losses}`, inline: true },
          { name: 'Kills', value: `${data.ranked.kills}`, inline: true },
          { name: 'Deaths', value: `${data.ranked.deaths}`, inline: true },
          { name: 'KD', value: `${data.ranked.kd}`, inline: true },
          { name: 'Matches Played', value: `${data.ranked.matchesPlayed}`, inline: true }
        );
      }

      // Add Casual/Standard stats if available
      if (data.standard) {
        embed.addFields(
          { name: '\u200B', value: '\u200B' },
          { name: '--- Casual ---', value: '\u200B' },
          { name: 'Wins', value: `${data.standard.wins}`, inline: true },
          { name: 'Losses', value: `${data.standard.losses}`, inline: true },
          { name: 'Kills', value: `${data.standard.kills}`, inline: true },
          { name: 'Deaths', value: `${data.standard.deaths}`, inline: true },
          { name: 'KD', value: `${data.standard.kd}`, inline: true },
          { name: 'Matches Played', value: `${data.standard.matchesPlayed}`, inline: true }
        );
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error fetching R6 stats:`, error.message);
      await interaction.reply({ content: 'Could not fetch stats. Make sure the username and platform are correct.', ephemeral: true });
    }
  }
};
