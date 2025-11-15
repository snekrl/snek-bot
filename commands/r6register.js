const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { addOrUpdatePlayer } = require('../leaderboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('r6register')
    .setDescription('Register your R6 account for the leaderboard')
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

      // Add player to leaderboard
      addOrUpdatePlayer({
        username,
        platform,
        rankPoints: data.ranked.rankPoints,
        wins: data.ranked.wins,
        losses: data.ranked.losses,
        kd: data.ranked.kd
      });

      await interaction.reply({ content: `${username} has been registered to the leaderboard!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Could not fetch stats. Check username/platform.', ephemeral: true });
    }
  }
};
