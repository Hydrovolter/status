const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // Make sure you have this intent enabled
  ],
});

const userIdToFetch = "958298682044866631"; // Replace with the user ID you want to track

// Mapping for activity types
const activityTypeMap = {
  0: "Playing",
  1: "Streaming",
  2: "Listening",
  3: "Watching",
  4: "Custom",
};

// Function to fetch and return a specific user's presence data
async function fetchUserPresence(userId) {
  try {
    // Get the user from the bot's guild
    const member = await client.guilds.cache.first().members.fetch(userId); // Get the first guild and member by user ID

    if (!member) {
      return { error: "User not found in the guild." };
    }

    const presence = member.presence;
    if (!presence) {
      return { error: "User has no presence data." };
    }

    // User status (e.g., online, offline, dnd, idle)
    const status = presence.status;

    // Activity (e.g., Playing, Listening, Watching)
    const activity = presence.activities[0]; // Only get the first activity

    const activityType = activity
      ? activityTypeMap[activity.type] || "Unknown"
      : "None";
    const activityText = activity
      ? activity.state || "No description"
      : "No activity";
    const activityDetails = activity
      ? activity.details || "No details"
      : "No details";
    const activityImage =
      activity && activity.assets ? activity.assets.largeImageURL() : "";

    return {
      status,
      activityType,
      activityText,
      activityDetails,
      activityImage,
    };
  } catch (error) {
    console.error("Error fetching user presence:", error);
    return { error: "Failed to retrieve presence data." };
  }
}

// Create an Express app
const app = express();
const port = process.env.PORT || 3000; // You can use port 3000 or use the port provided by Replit

// Endpoint to get the user's presence data
app.get("/api/presence", async (req, res) => {
  const userPresence = await fetchUserPresence(userIdToFetch);
  res.json(userPresence); // Send the JSON response to the client
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Discord bot login
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Log in to Discord with your bot's token
client.login(process.env.DISCORD_TOKEN);
