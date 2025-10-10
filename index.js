const { Client, GatewayIntentBits, IntentsBitField, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { token, snekId } = require("../config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.commands = new Collection();
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command?.autocomplete) return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error("Autocomplete error:", error);
      await interaction.respond([]).catch(console.error);
    }
    return;
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Command error:", error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error executing this command.",
          ephemeral: true,
        }).catch(console.error);
      } else {
        await interaction.reply({
          content: "There was an error executing this command.",
          ephemeral: true,
        }).catch(console.error);
      }
    }
  }
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  const content = message.content.toLowerCase();

  if (content.includes("siege") || content.includes("r6")) {
    message.reply(`<@${snekId}>`);
  }
});

client.login(token);
