const { Client, GatewayIntentBits } = require("discord.js");
const { fetchUserPresence } = require("./fetchUserPresence");
const cors = require("cors");

const allowedOrigins = ["http://localhost:5503", "https://hydrovolter.pages.dev/", "https://hydrovolter.vercel.app/"]; // Add your frontend origin here
app.use(cors({ origin: allowedOrigins }));


// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // Required to fetch user presence
  ],
});

const userIdToFetch = "958298682044866631"; // Replace with the user ID to track

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

// Log presence data periodically (for debugging or logging purposes)
setInterval(async () => {
  const presenceData = await fetchUserPresence(client, userIdToFetch);
  console.log("User Presence:", presenceData);
}, 60000); // Every 60 seconds

// Log in to Discord
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("Failed to log in:", err);
});
