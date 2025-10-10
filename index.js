const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { token, snekId } = require('./config.json');

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

client.login(token);
