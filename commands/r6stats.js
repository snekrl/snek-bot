const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.R6_API_KEY;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('r6stats')
    .setDescription('Check Rainbow Six Siege player stats')
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
      const res = await axios.get(`https://api2.r6stats.com/public-api/stats/${username}/${platform}/general`, {
        headers: { Authorization: apiKey },
      });

      const data = res.data;
      const stats = data.stats.general;

      const embed = new EmbedBuilder()
        .setTitle(`${data.player.username}'s R6 Stats`)
        .setThumbnail(data.player.avatar_url)
        .addFields(
          { name: 'Level', value: `${data.player.progression.level}`, inline: true },
          { name: 'K/D Ratio', value: `${stats.kd.toFixed(2)}`, inline: true },
          { name: 'Win %', value: `${(stats.winloss * 100).toFixed(1)}%`, inline: true },
          { name: 'Kills', value: `${stats.kills}`, inline: true },
          { name: 'Deaths', value: `${stats.deaths}`, inline: true },
          { name: 'Wins', value: `${stats.wins}`, inline: true },
          { name: 'Losses', value: `${stats.losses}`, inline: true }
        )
        .setColor(0x00AEFF)
        .setFooter({ text: 'Data provided by R6Stats API' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error.response?.data || error);
      await interaction.editReply('❌ Could not find that player or fetch stats.');
    }
  },
};
