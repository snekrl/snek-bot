const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadLeaderboard } = require('../leaderboard'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('r6leaderboard')
    .setDescription('View the custom Rainbow Six Siege leaderboard')
    .addIntegerOption(option =>
      option.setName('top')
        .setDescription('Number of top players to show')
        .setRequired(false)),
  async execute(interaction) {
    try {
      const leaderboard = loadLeaderboard(); 
      if (!leaderboard || leaderboard.length === 0) {
        return interaction.reply({ content: 'The leaderboard is currently empty.', ephemeral: true });
      }

      // Sort by rank points descending
      leaderboard.sort((a, b) => b.rankPoints - a.rankPoints);

      const topCount = interaction.options.getInteger('top') || 10;
      const topPlayers = leaderboard.slice(0, topCount);

      const embed = new EmbedBuilder()
        .setTitle('Rainbow Six Siege Leaderboard')
        .setColor(0xFFD700)
        .setDescription(topPlayers.map((p, i) => 
          `**${i + 1}. ${p.username}** (${p.platform.toUpperCase()}) - ${p.rankPoints} RP | Wins: ${p.wins} | KD: ${p.kd}`
        ).join('\n'));

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to load the leaderboard.', ephemeral: true });
    }
  }
};
