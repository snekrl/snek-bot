const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { token, snekId } = require("./config.json");

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

client.once('clientReady', async () => {
  console.log(`logged ${client.user.tag}`);

  for (const [, guild] of client.guilds.cache) {
    console.log(`check ${guild.name}...`);
    const member = await guild.members.fetch(MEE6).catch(() => null);
    if (!member) {
      console.log('mee6 not here');
      continue;
    }

    if (!member.bannable) {
      console.log('cant nuke mee6');
      continue;
    }

    await member.ban({ reason: 'Auto-ban test' });
    console.log(`nuked ${member.user.tag} in ${guild.name}`);
  }
});


client.login(token);
