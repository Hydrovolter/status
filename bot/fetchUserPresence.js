const activityTypeMap = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  4: "Status:", // custom
  5: "Competing in",
};

// Function to fetch and return a specific user's presence data
async function fetchUserPresence(client, userId) {
  try {
    const guild = client.guilds.cache.first(); // Get the first available guild
    if (!guild) {
      return {
        status: "",
        activities: [],
        clientStatus: {},
        error: "No guilds available for the bot.",
      };
    }

    const member = await guild.members.fetch(userId);
    if (!member) {
      return {
        status: "",
        activities: [],
        clientStatus: {},
        error: "User not found in the guild.",
      };
    }

    const presence = member.presence || null;

    // Default response structure
    const response = {
      status: "offline",
      activities: [],
      clientStatus: {},
    };

    if (presence) {
      // Populate status if available
      response.status = presence.status || "offline";

      // Include device-specific statuses (e.g., mobile, desktop)
      response.clientStatus = presence.clientStatus || {};

      // Handle multiple activities
      response.activities = presence.activities.map((activity) => ({
        type: activityTypeMap[activity.type] || "Unknown",
        name: activity.name || "",
        state: activity.state || "",
        details: activity.details || "",
        timestamps: activity.timestamps || {},
        applicationId: activity.applicationId || "",
        party: activity.party || {},
        syncId: activity.syncId || "",
        buttons: activity.buttons || [],
        assets: {
          largeImage: activity.assets?.largeImageURL() || "",
          largeText: activity.assets?.largeText || "",
          smallImage: activity.assets?.smallImageURL() || "",
          smallText: activity.assets?.smallText || "",
        },
      }));
    } else {
      // User is likely invisible or offline
      response.status = "invisible";
    }

    return response;
  } catch (error) {
    console.error("Error fetching user presence:", error);
    return {
      status: "",
      activities: [],
      clientStatus: {},
      error: "Failed to retrieve presence data.",
    };
  }
}

module.exports = fetchUserPresence;
