const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.TRACKER_API_KEY;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('r6stats')
    .setDescription('Check Rainbow Six Siege player stats using Tracker.gg')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The player username')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('The platform (uplay, psn, xbox)')
        .setRequired(true)
        .addChoices(
          { name: 'PC (uplay)', value: 'uplay' },
          { name: 'PlayStation', value: 'psn' },
          { name: 'Xbox', value: 'xbl' }
        )
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const platform = interaction.options.getString('platform');

    await interaction.deferReply();

    try {
      const url = `https://public-api.tracker.gg/v2/r6siege/standard/profile/${platform}/${encodeURIComponent(username)}`;
      const res = await axios.get(url, {
        headers: { 'TRN-Api-Key': process.env.TRACKER_API_KEY }
      });

      const data = res.data.data;
      const stats = data.segments.find(s => s.type === 'overview')?.stats;

      if (!stats) {
        await interaction.editReply('No stats found for that player.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${data.platformInfo.platformUserHandle}'s R6 Siege Stats`)
        .setThumbnail(data.platformInfo.avatarUrl)
        .addFields(
          { name: 'Level', value: stats.level?.displayValue ?? 'N/A', inline: true },
          { name: 'Kills', value: stats.kills?.displayValue ?? 'N/A', inline: true },
          { name: 'Deaths', value: stats.deaths?.displayValue ?? 'N/A', inline: true },
          { name: 'K/D Ratio', value: stats.kdRatio?.displayValue ?? 'N/A', inline: true },
          { name: 'Win %', value: stats.wlPercentage?.displayValue ?? 'N/A', inline: true },
          { name: 'Matches Played', value: stats.matchesPlayed?.displayValue ?? 'N/A', inline: true }
        )
        .setColor(0x00AEFF)
        .setFooter({ text: 'Data provided by Tracker.gg API' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error.response?.data || error);
      await interaction.editReply('Could not find that player or fetch stats.');
    }
  },
};
