const { Client, GatewayIntentBits } = require("discord.js");
const keepAlive = require("./keepAlive");
const dotenv = require("dotenv");
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

// Login to Discord
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);

setInterval(keepAlive, 1800000); // Adjust the interval (in milliseconds) as needed

module.exports = client;
