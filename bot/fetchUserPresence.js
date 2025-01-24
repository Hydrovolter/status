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
        return { error: "No guilds available for the bot." };
      }
  
      const member = await guild.members.fetch(userId);
      if (!member) {
        return { error: "User not found in the guild." };
      }
  
      const presence = member.presence;
      if (!presence) {
        return { error: "User has no presence data." };
      }
  
      const status = presence.status;
      const activity = presence.activities[0];
  
      return {
        status,
        activityType: activity
          ? activityTypeMap[activity.type] || "Unknown"
          : "None",
        activityText: activity?.state || "No description",
        activityDetails: activity?.details || "No details",
        activityImage: activity?.assets?.largeImageURL() || "",
      };
    } catch (error) {
      console.error("Error fetching user presence:", error);
      return { error: "Failed to retrieve presence data." };
    }
  }
  
  module.exports = fetchUserPresence;
  