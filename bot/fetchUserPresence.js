const activityTypeMap = {
    0: "Playing",
    1: "Streaming",
    2: "Listening",
    3: "Watching",
    4: "Custom",
  };
  
  // Function to fetch and return a specific user's presence data
  async function fetchUserPresence(client, userId) {
    try {
      const guild = client.guilds.cache.first(); // Get the first available guild
      if (!guild) {
        return {
          status: "",
          activityType: "",
          activityText: "",
          activityDetails: "",
          activityImage: "",
          error: "No guilds available for the bot.",
        };
      }
  
      const member = await guild.members.fetch(userId);
      if (!member) {
        return {
          status: "",
          activityType: "",
          activityText: "",
          activityDetails: "",
          activityImage: "",
          error: "User not found in the guild.",
        };
      }
  
      const presence = member.presence || null;
  
      // Default response structure
      const response = {
        status: "offline",
        activityType: "",
        activityText: "",
        activityDetails: "",
        activityImage: "",
      };
  
      if (presence) {
        // Populate status if available
        response.status = presence.status || "offline";
  
        // Handle activity data if it exists
        const activity = presence.activities[0]; // Only fetch the first activity
        if (activity) {
          response.activityType =
            activityTypeMap[activity.type] || "";
          response.activityText = activity.state || "";
          response.activityDetails = activity.details || "";
          response.activityImage =
            activity.assets?.largeImageURL() || "";
        }
      } else {
        // User is likely invisible or offline
        response.status = "invisible";
      }
  
      return response;
    } catch (error) {
      console.error("Error fetching user presence:", error);
      return {
        status: "",
        activityType: "",
        activityText: "",
        activityDetails: "",
        activityImage: "",
        error: "Failed to retrieve presence data.",
      };
    }
  }
  
  module.exports = fetchUserPresence;
  