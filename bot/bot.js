const { Client, GatewayIntentBits } = require("discord.js");
const cors = require("cors");

const allowedOrigins = ["http://localhost:5503", "https://hydrovolter.pages.dev/", "https://hydrovolter.vercel.app/"]; // Add your frontend origin here
app.use(cors({ origin: allowedOrigins }));


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

module.exports = client;
