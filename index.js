const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { token, snekId } = require("config.json");

const MEE6 = '159985415099514880';   // MEE6 USER ID       

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});


async function banTargetIfPresent(guild) {
  try {
    const member = await guild.members.fetch(MEE6).catch(() => null);
    if (!member) return;
    if (!member.bannable) {
      console.log(`[${guild.name}] ${member.user.tag} higher role or no permission to nuke`);
      return;
    }
    await member.ban({ reason: 'nuked mee6' });
    console.log(`[${guild.name}] NUKED ${member.user.tag} (${member.id})`);
  } catch (err) {
    console.error(`[${guild.name}] cant nuke:`, err);
  }
}

client.once('ready', async () => {
  console.log(`logged${client.user.tag}`);
  for (const [, guild] of client.guilds.cache) {
    await banTargetIfPresent(guild);
  }
  console.log('mee6 not present, if join nuke');
});

client.on('guildMemberAdd', (member) => {
  if (member.id === MEE6) {
    banTargetIfPresent(member.guild);
  }
});


client.login(token);
