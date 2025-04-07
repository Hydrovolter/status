const express = require("express");
const fetchUserPresence = require("../bot/fetchUserPresence");
const client = require("../bot/bot");
const cors = require("cors");




const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5503",
  "https://hydrovolter.pages.dev/",
  "http://hydrovolter.pages.dev",
  "https://hydrovolter.vercel.app/",
  "http://hydrovolter.vercel.app",
  "https://hydrovolter.com/",
  "http://hydrovolter.com",
  "https://hydrovolter.github.io",
  "http://hydrovolter.github.io",
  "https://hydrovolter.netlify.app",
  "http://hydrovolter.netlify.app"
];

app.use(cors({ origin: allowedOrigins }));

// Route to get presence data
app.get("/api/presence", async (req, res) => {
  const userId = process.env.USER_ID; // Fetch user ID from environment
  const presence = await fetchUserPresence(client, userId);
  if (presence.error) {
    return res.status(500).json({ error: presence.error });
  }

  res.json(presence);
});

app.get("/keep-alive", (req, res) => {
  res.status(200).send("OK");
});

// Start the server
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
