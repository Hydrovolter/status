const express = require("express");
const fetchUserPresence = require("../bot/fetchUserPresence");
const { fetchAnalytics } = require("./fetchAnalytics");
const client = require("../bot/bot");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { createBot } = require('../bot/mc');




let vscodeJson = {
  "workspace":"",
  "fileName":"",
  "language":"",
  "line":0,
  "column":0,
  "startTime":0,
  "elapsedTime":0
}
let resetTimer;


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5503",
  "https://hydrovolter.pages.dev",
  "http://hydrovolter.pages.dev",
  "https://hydrovolter.vercel.app",
  "http://hydrovolter.vercel.app",
  "https://hydrovolter.com",
  "http://hydrovolter.com",
  "https://hydrovolter.github.io",
  "http://hydrovolter.github.io",
  "https://hydrovolter.netlify.app",
  "http://hydrovolter.netlify.app",
  "https://hydrovolter.web.app",
  "http://hydrovolter.web.app",
  "https://hydrovolter.firebaseapp.com",
  "http://hydrovolter.firebaseapp.com",
  "https://hydrovolters.pages.dev",
  "http://hydrovolters.pages.dev",
];

app.use(cors({ origin: allowedOrigins }));



// Route to get presence data
app.get("/api/discord", async (req, res) => {
  const userId = process.env.USER_ID; // Fetch user ID from environment
  const presence = await fetchUserPresence(client, userId);
  if (presence.error) {
    return res.status(500).json({ error: presence.error });
  }

  res.json(presence);
});

app.get("/api/analytics", async (req, res) => {
  const analytics = await fetchAnalytics();

  if (analytics.error) {
    return res.status(500).json({ error: analytics.error });
  }

  res.json(analytics);
});

function resetVscodeJson() {
  vscodeJson = {
    "workspace":"",
    "fileName":"",
    "language":"",
    "line":0,
    "column":0,
    "startTime":0,
    "elapsedTime":0
  }
}


// VSCode presence endpoint
app.options("/api/vscode", (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.set({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    });
    return res.sendStatus(204);
  } else {
    return res.status(403).send("Origin Not Allowed");
  }
});

app.post("/api/vscode", (req, res) => {
  const origin = req.headers.origin;
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.SECRET_API_KEY) {
    return res.status(403).send("Forbidden: Invalid API Key");
  }

  vscodeJson = req.body;

  // Reset the inactivity timer
  clearTimeout(resetTimer);
  resetTimer = setTimeout(resetVscodeJson, 14000); // 15s

  res.set("Access-Control-Allow-Origin", origin);
  return res.status(200).send("Data stored successfully");
});

app.get("/api/vscode", (req, res) => {
  const origin = req.headers.origin;
  res.set({
    "Access-Control-Allow-Origin": origin,
    "Content-Type": "application/json"
  });
  return res.status(200).json(vscodeJson);
});

app.get("/keep-alive", (req, res) => {
  res.status(200).send("OK");
});

// Start the server
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});

// MC Bot

// createBot();