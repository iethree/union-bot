
import axios from 'axios';
import "dotenv/config";
import { createRequire } from 'module';
import fs from 'fs';

// For older Node.js versions that might need this approach for __dirname
const require = createRequire(import.meta.url);

// Warcraft Logs API configuration
const CLIENT_ID = process.env.WARCRAFTLOGS_CLIENT_ID;
const CLIENT_SECRET = process.env.WARCRAFTLOGS_CLIENT_SECRET;
const BASE_URL = 'https://www.warcraftlogs.com/api/v2/client';
const GUILD_ID = process.env.GUILD_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !GUILD_ID) {
  console.error('Missing required environment variables: WARCRAFTLOGS_CLIENT_ID, WARCRAFTLOGS_CLIENT_SECRET, GUILD_ID');
}

// GraphQL query to fetch recent reports for a specific guild
const GUILD_REPORTS_QUERY = `
  query GetGuildReports($guildID: Int!, $limit: Int!) {
    reportData {
      reports(guildID: $guildID, limit: $limit) {
        data {
          code
          title
          startTime
          endTime
          owner {
            name
          }
          zone {
            name
          }
        }
      }
    }
  }
`;

// Fixed GraphQL query for rankings based on the error message
const REPORT_RANKINGS_QUERY = `
query GetReportRankingsWithDPS($reportCode: String!) {
  reportData {
    report(code: $reportCode) {
      fights {
        id
        name
        difficulty
        encounterID
        kill
        startTime
        endTime
      }
      playerDetails
      rankedCharacters {
        name
        id
        server {
          name
          region {
            name
          }
        }
        classID
      }
      rankings(compare: Parses)
      table(dataType: DamageDone)
    }
  }
}
`;

// Function to get an access token
async function getAccessToken() {
  try {
    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');

    const response = await axios({
      method: 'post',
      url: 'https://www.warcraftlogs.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET
      },
      data: formData
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

// Function to fetch recent reports for a specific guild
async function fetchGuildReports(guildID, limit = 10) {
  try {
    const accessToken = await getAccessToken();
    console.log(`Successfully obtained access token. Fetching reports for guild ID: ${guildID}`);

    const response = await axios({
      method: 'post',
      url: BASE_URL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        query: GUILD_REPORTS_QUERY,
        variables: {
          guildID: Number(guildID),
          limit: limit
        }
      }
    });
    console.log('response', response.data);

    return response.data.data.reportData.reports.data;
  } catch (error) {
    console.error('Error fetching guild reports:', error.response?.data || error.message);
    throw error;
  }
}

// Function to fetch DPS rankings for a specific report
async function fetchReportRankings(reportCode, accessToken) {
  try {
    console.log(`Fetching DPS rankings for report: ${reportCode}`);

    const response = await axios({
      method: 'post',
      url: BASE_URL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        query: REPORT_RANKINGS_QUERY,
        variables: {
          reportCode: reportCode
        }
      }
    });

    // Debug info if needed
    if (!response.data || !response.data.data) {
      console.log('API Response structure issue. Response:', JSON.stringify(response.data, null, 2));
      return null;
    }

    // Check path to data
    if (!response.data.data.reportData || !response.data.data.reportData.report) {
      console.log('Report data not found in API response. Path issue:',
                  Object.keys(response.data.data));
      return null;
    }

    return response.data.data.reportData.report;
  } catch (error) {
    console.error(`Error fetching rankings for report ${reportCode}:`, error.message);
    // Log more details about the error
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    return null;
  }
}

// Get the class color for formatting console output
function getClassColor(className) {
  const classColors = {
    'DeathKnight': '[2;31m',   // Red
    'DemonHunter': '[2;37m',  // Purple
    'Druid': '[2;31m',        // Orange
    'Evoker': '[2;32m',       // Green-blue
    'Hunter': '[2;32m',      // Light green
    'Mage': '[2;36m',         // Light blue
    'Monk': '[2;32m',          // Jade green
    'Paladin': '[2;35m',     // Pink
    'Priest': '[2;37m',      // White
    'Rogue': '[2;33m',       // Yellow
    'Shaman': '[2;34m',        // Blue
    'Warlock': '[2;37m',     // Purple
    'Warrior': '[2;37m'      // Brown
  };

  return '' + (classColors[className] || '[0m'); // Default to reset color
}

// Format timestamp to readable date
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// Format duration in a more readable way
function formatDuration(startTime, endTime) {
  const durationMinutes = Math.round((endTime - startTime) / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}


function processRankings(fights) {
  const processedFights = fights.map(fight => ({
    name: fight.encounter.name,
    dps: ([...fight.roles.dps.characters, ...fight.roles.tanks.characters]).map(player => ({
      name: player.name,
      class: player.class,
      itemLevel: player.bracketData,
      dps: player.amount,
      bracketPercent: player.bracketPercent,
      rankPercent: player.rankPercent,
    })).sort((a, b) => b.bracketPercent - a.bracketPercent),
  }));
  return processedFights;
}

function summarizeFights(fights) {
  const player = {
    name: 'PlayerName',
    class: 'PlayerClass',
    itemLevel: 658,
    dps: [0, 1, 2],
    bracketPercent: [0, 1, 2],
    rankPercent: [0, 1, 2],
  }

  const players = {};

  fights.forEach(fight => {
    fight.dps.forEach(player => {
      if (!players[player.name]) {
        players[player.name] = {
          name: player.name,
          class: player.class,
          itemLevel: player.itemLevel,
          dps: [],
          bracketPercent: [],
          rankPercent: [],
        };
      }

      players[player.name].dps.push(player.dps);
      players[player.name].bracketPercent.push(player.bracketPercent);
      players[player.name].rankPercent.push(player.rankPercent);
    });
  });

  const summary = Object.values(players).map(player => ({
    name: player.name,
    class: player.class,
    itemLevel: player.itemLevel,
    dps: player.dps.reduce((a, b) => a + b, 0) / player.dps.length,
    bracketPercent: Math.round(player.bracketPercent.reduce((a, b) => a + b, 0) / player.bracketPercent.length),
    rankPercent: Math.round(player.rankPercent.reduce((a, b) => a + b, 0) / player.rankPercent.length),
  }));
  summary.sort((a, b) => b.bracketPercent - a.bracketPercent);

  return summary;
}


export async function getLastRaidReport() {
  try {
    const reports = await fetchGuildReports(GUILD_ID, 1); // Limit to 1 reports to avoid rate limiting

    if (reports.length === 0) {
      console.log(`\nNo reports found for guild ID: ${GUILD_ID}`);
      return;
    }

    console.log(`\n===== Recent Warcraft Logs Reports for Guild ID: ${GUILD_ID} =====\n`);

    // Get a new access token for ranking queries
    const accessToken = await getAccessToken();

    // Process each report
    for (const report of reports) {
      console.log(`REPORT: ${report.title}`);
      console.log(`  Code: ${report.code}`);
      console.log(`  URL: https://www.warcraftlogs.com/reports/${report.code}`);
      console.log(`  Owner: ${report.owner.name}`);
      console.log(`  Zone: ${report.zone.name}`);
      console.log(`  Start: ${formatTimestamp(report.startTime)}`);
      console.log(`  Duration: ${formatDuration(report.startTime, report.endTime)}`);

      // Fetch and display player DPS rankings for this report
      const reportData = await fetchReportRankings(report.code, accessToken);

      if (!reportData) {
        console.log('  Could not retrieve report data.');
        console.log('\n' + '='.repeat(60) + '\n');
        continue;
      }

      console.log('\n  PLAYER DPS RANKINGS:');

      const fights = processRankings(reportData.rankings.data);
      const overall = summarizeFights(fights);

      const summary = `\n\[1;37m${report.zone.name}[0m\n` + overall.map(getPlayerLine).join('\n');
      const detail = fights.map(fight => {
        return `\n\[1;37m${fight.name}[0m\n` + fight.dps.map(getPlayerLine).join('\n');
      });

      return ({
        summary,
        fights: detail,
        title: report.title,
        date: formatTimestamp(report.startTime),
      });

    }
  } catch (error) {
    console.error('Failed to fetch guild reports:', error);
  }
}

const getPlayerLine = (player) => {
  const classColor = getClassColor(player.class);
  return `  ${classColor}${player.name.padEnd(16)} (${player.itemLevel}) - ${roundDps(player.dps).padStart(5)} DPS (${player.bracketPercent}%)`;
}

const roundDps = (dps) => {
  if (dps > 1000000) {
    return Number(Math.round(dps / 10000) / 100).toFixed(2) + "M";
  }
  if (dps > 1000) {
    return Math.round(dps / 1000) + "K";
  }
  return Math.round(dps);
}
