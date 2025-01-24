const activityTypeMap = {
  0: "Playing",
  1: "Streaming",
  2: "Listening",
  3: "Watching",
  4: "Custom",
};

async function fetchUserPresence(client, userId) {
  try {
    const guild = client.guilds.cache.first(); // Get the first available guild
    if (!guild) return { error: "No guilds available for the bot." };

    const member = await guild.members.fetch(userId);
    if (!member) return { status: "invisible", activity: "None", details: "" };

    const { presence } = member;
    if (!presence) return { status: "invisible", activity: "None", details: "" };

    const status = presence.status || "invisible";
    const activity = presence.activities[0];
    const activityType = activity ? activityTypeMap[activity.type] : "None";
    const activityDetails = activity ? activity.details || "No details" : "";
    const activityImage =
      activity && activity.assets ? activity.assets.largeImageURL() : "";

    return {
      status,
      activityType,
      activityDetails,
      activityImage,
    };
  } catch (error) {
    console.error("Error fetching user presence:", error);
    return { error: "Failed to retrieve presence data." };
  }
}

module.exports = { fetchUserPresence };
