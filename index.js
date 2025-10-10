const path = require("path");
const { token, snekId } = require("config.json");


client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  const content = message.content.toLowerCase();

  if (content.includes("siege") || content.includes("r6")) {
    message.reply(`<@${snekId}>`);
  }
});

client.login(token);
