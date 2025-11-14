const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rlstats-doesnt-work-atm')
    .setDescription('Look up a Rocket League player\'s stats')
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Choose the platform')
        .setRequired(true)
        .addChoices(
          { name: 'Steam', value: 'steam' },
          { name: 'Epic Games', value: 'epic' },
          { name: 'Xbox', value: 'xbox' },
          { name: 'PSN', value: 'psn' }
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

      if (!data) return interaction.reply({ content: 'No stats found for this player.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle(`${data.username} - ${platform.toUpperCase()} Rocket League Stats`)
        .setColor(0x1F8B4C);

      // If API returns playlist segments, iterate over them
      if (data.playlists) {
        for (const playlist of data.playlists) {
          embed.addFields(
            { name: `\u200B`, value: `**${playlist.name}**` },
            { name: 'MMR', value: `${playlist.mmr}`, inline: true },
            { name: 'Wins', value: `${playlist.wins}`, inline: true },
            { name: 'Losses', value: `${playlist.losses}`, inline: true },
            { name: 'Goals', value: `${playlist.goals}`, inline: true },
            { name: 'Assists', value: `${playlist.assists}`, inline: true },
            { name: 'Saves', value: `${playlist.saves}`, inline: true },
            { name: 'Shots', value: `${playlist.shots}`, inline: true }
          );
        }
      } else {
        // Fallback for overall stats
        embed.addFields(
          { name: 'MMR', value: `${data.mmr}`, inline: true },
          { name: 'Wins', value: `${data.wins}`, inline: true },
          { name: 'Losses', value: `${data.losses}`, inline: true },
          { name: 'Goals', value: `${data.goals}`, inline: true },
          { name: 'Assists', value: `${data.assists}`, inline: true },
          { name: 'Saves', value: `${data.saves}`, inline: true },
          { name: 'Shots', value: `${data.shots}`, inline: true }
        );
      }

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error('RL command error:', err.message);
      await interaction.reply({ content: 'Could not fetch Rocket League stats. Make sure the username and platform are correct.', ephemeral: true });
    }
  }
};
