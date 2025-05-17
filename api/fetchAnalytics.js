const { google } = require("googleapis");
const path = require("path");

// Authenticate with service account
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "hydrovolter-analytics-key.json"),
  scopes: "https://www.googleapis.com/auth/analytics.readonly",
});

const analyticsDataClient = google.analyticsdata({
  version: "v1beta",
  auth,
});

// Replace with your GA4 property ID
const PROPERTY_ID = "486049235";

async function fetchAnalytics() {
  try {
    // Active users in last 30 minutes
    const activeResponse = await analyticsDataClient.properties.runRealtimeReport({
      property: `properties/${PROPERTY_ID}`,
      requestBody: {
        dimensions: [{ name: "unifiedScreenName" }],
        metrics: [{ name: "activeUsers" }],
      },
    });

    const activeUsers = activeResponse.data.rows?.reduce((sum, row) => {
      return sum + parseInt(row.metricValues[0].value);
    }, 0) || 0;

    // Total users & page views all time
    const totalsResponse = await analyticsDataClient.properties.runReport({
      property: `properties/${PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
        metrics: [
          { name: "totalUsers" },
          { name: "screenPageViews" },
        ],
      },
    });

    const totalUsers = parseInt(totalsResponse.data.rows?.[0]?.metricValues?.[0]?.value || "0");
    const totalPageViews = parseInt(totalsResponse.data.rows?.[0]?.metricValues?.[1]?.value || "0");

    return {
      activeUsersLast30Min: activeUsers,
      totalUsers,
      totalPageViews,
    };
  } catch (error) {
    return { error: error.message };
  }
}


module.exports = { fetchAnalytics };
