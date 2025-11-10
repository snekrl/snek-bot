const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token, snekId } = require('./config.json');
require('dotenv').config();
console.log('Tracker API Key:', process.env.TRACKER_API_KEY);


const apiKey = process.env.R6_API_KEY;
const MEE6 = '159985415099514880';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();

// --- Load command files ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// --- Register commands globally ---
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    console.log('Registering slash commands...');
    const guildId = '1178369590565285908';
    await rest.put(Routes.applicationGuildCommands(snekId, guildId), { body: commands });
    console.log('Slash commands registered.');
  } catch (err) {
    console.error('Error registering commands:', err);
  }
})();

// --- MEE6 auto-ban logic ---
async function banTargetIfPresent(guild) {
  try {
    const member = await guild.members.fetch(MEE6, { force: true }).catch(() => null);
    if (!member) return console.log(`[${guild.name}] MEE6 not found`);
    if (!member.bannable) return console.log(`[${guild.name}] MEE6 found but can’t nuke`);
    await member.ban({ reason: 'auto nuke MEE6' });
    console.log(`[${guild.name}] nuked ${member.user.tag}`);
  } catch (err) {
    console.error(`[${guild.name}] error when nuking`, err);
  }
}

client.once('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  for (const [, guild] of client.guilds.cache) {
    console.log(`Scanning server - ${guild.name}`);
    await banTargetIfPresent(guild);
  }
  console.log('Bot is ready.');
});

// --- Handle command interactions ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
});

client.login(token);
