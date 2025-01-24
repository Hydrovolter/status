const express = require("express");
const { fetchUserPresence } = require("./fetchUserPresence");
const { Client, GatewayIntentBits } = require("discord.js");
const cors = require("cors");

const allowedOrigins = ["http://localhost:5503", "https://hydrovolter.pages.dev/", "https://hydrovolter.vercel.app/"]; // Add your frontend origin here
app.use(cors({ origin: allowedOrigins }));


// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // Required to fetch user presence
  ],
});

const userIdToFetch = "958298682044866631"; // Replace with the user ID to track

// Express app setup
const app = express();
const port = process.env.PORT || 3000;

app.get("/api/presence", async (req, res) => {
  const presenceData = await fetchUserPresence(client, userIdToFetch);
  res.json(presenceData);
});

// Start the Express server
app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("Failed to log in:", err);
});
