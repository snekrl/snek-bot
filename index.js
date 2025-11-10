const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { token, snekId } = require('./config.json');

require('dotenv').config();
const apiKey = process.env.R6_API_KEY;


const MEE6 = '159985415099514880'; // MEE6 USER ID

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

async function banTargetIfPresent(guild) {
  try {
    const member = await guild.members.fetch(MEE6, { force: true }).catch(() => null);

    if (!member) {
      console.log(`[${guild.name}] mee6 not found`);
      return;
    }

    if (!member.bannable) {
      console.log(`[${guild.name}] mee6 found but cant nuke`);
      return;
    }

    await member.ban({ reason: 'auto nuke mee6' });
    console.log(`[${guild.name}] nuked ${member.user.tag}`);
  } catch (err) {
    console.error(`[${guild.name}] error when nuking`, err);
  }
}

client.once('ready', async () => {
  console.log(`logged in as ${client.user.tag}`);

  for (const [, guild] of client.guilds.cache) {
    console.log(`scan server - ${guild.name} (${guild.id})`);
    await banTargetIfPresent(guild); // call the async function here
  }
});

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

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
    const apiKey = 'YOUR_R6STATS_API_KEY'; // keep this secret

    await interaction.deferReply();

    try {
      const res = await axios.get(`https://api2.r6stats.com/public-api/stats/${username}/${platform}/general`, {
        headers: { Authorization: apiKey }
      });

      const data = res.data;
      const stats = data.stats.general;

      const embed = new EmbedBuilder()
        .setTitle(`${data.player.username}'s R6 Stats`)
        .setThumbnail(data.player.avatar_url)
        .addFields(
          { name: 'Level', value: `${data.player.progression.level}`, inline: true },
          { name: 'K/D Ratio', value: `${stats.kd.toFixed(2)}`, inline: true },
          { name: 'Win %', value: `${stats.winloss * 100}%`, inline: true },
          { name: 'Kills', value: `${stats.kills}`, inline: true },
          { name: 'Deaths', value: `${stats.deaths}`, inline: true },
          { name: 'Wins', value: `${stats.wins}`, inline: true },
          { name: 'Losses', value: `${stats.losses}`, inline: true }
        )
        .setColor(0x00AEFF)
        .setFooter({ text: 'Data provided by R6Stats API' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Could not find that player or fetch stats.');
    }
  },
};


client.login(token);
