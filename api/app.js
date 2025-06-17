const express = require("express");
const fetchUserPresence = require("../bot/fetchUserPresence");
const { fetchAnalytics } = require("./fetchAnalytics");
const client = require("../bot/bot");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// --- Import new modules ---
const { downloadSite } = require('./downloader');
const fs = require('fs/promises');

const { createBot } = require('../bot/mc');

let vscodeJson = {
  "workspace":"", "fileName":"", "language":"", "line":0, "column":0, "startTime":0, "elapsedTime":0
};
let resetTimer;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// --- IMPORTANT: UPDATE CORS ---
const allowedOrigins = [
  "http://localhost:5503",
  "https://hydrovolter.com", // Add your frontend domain
  "http://hydrovolter.com",  // Add www or non-http versions if needed
  "https://hydrovolter.pages.dev", "http://hydrovolter.pages.dev",
  "https://hydrovolter.vercel.app", "http://hydrovolter.vercel.app",
  "https://hydrovolter.github.io", "http://hydrovolter.github.io",
  "https://hydrovolter.netlify.app", "http://hydrovolter.netlify.app",
  "https://hydrovolter.web.app", "http://hydrovolter.web.app",
  "https://hydrovolter.firebaseapp.com", "http://hydrovolter.firebaseapp.com",
  "https://hydrovolters.pages.dev", "http://hydrovolters.pages.dev"
];

app.use(cors({ origin: allowedOrigins }));

// --- NEW SITE DOWNLOADER ENDPOINT ---
app.post("/api/download-site", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    let tempDir; // To store the temporary directory path for cleanup

    try {
        const siteName = new URL(url).hostname;
        const result = await downloadSite(url);
        
        // The downloader now returns the stream and the temp directory path
        const archiveStream = result.archive;
        tempDir = result.tempDir;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${siteName}.zip`);

        // Clean up the temporary directory after the download is complete or if the user aborts
        res.on('finish', () => {
            if (tempDir) {
                fs.rm(tempDir, { recursive: true, force: true }).catch(err => console.error(`Error cleaning up temp dir ${tempDir}:`, err));
            }
        });
        res.on('close', () => {
            if (tempDir) {
                fs.rm(tempDir, { recursive: true, force: true }).catch(err => console.error(`Error cleaning up temp dir ${tempDir}:`, err));
            }
        });

        // Pipe the zip stream directly to the response
        archiveStream.pipe(res);

    } catch (error) {
        console.error("Error during site download:", error);
        if (tempDir) { // Cleanup on error as well
            await fs.rm(tempDir, { recursive: true, force: true });
        }
        res.status(500).json({ error: error.message || "Failed to download the site." });
    }
});


// --- Your other existing API routes ---

app.get("/api/discord", async (req, res) => {
  const userId = process.env.USER_ID;
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
  vscodeJson = {"workspace":"","fileName":"","language":"","line":0,"column":0,"startTime":0,"elapsedTime":0};
}

app.options("/api/vscode", cors()); // Simplified CORS for this specific route if needed
app.post("/api/vscode", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.SECRET_API_KEY) {
    return res.status(403).send("Forbidden: Invalid API Key");
  }
  vscodeJson = req.body;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(resetVscodeJson, 14000);
  res.status(200).send("Data stored successfully");
});

app.get("/api/vscode", (req, res) => {
  res.status(200).json(vscodeJson);
});

app.get("/keep-alive", (req, res) => {
  res.status(200).send("OK");
});

// Start the server
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});

// MC Bot
//createBot();