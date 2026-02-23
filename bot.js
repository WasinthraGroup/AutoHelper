// bot.js — boot Discord client and helper functions
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.User]
});

client.once('ready', async () => {
  console.log(`Discord logged in as ${client.user.tag}`);
  // Optionally: start stats updater loop
  startStatsLoop();
});

client.on('error', console.error);

// Simple periodic stats updater (renames channels)
const fs = require('fs');
const path = require('path');
const storage = require('./utils_storage');
const config = require('./config/appConfig.json');

async function updateDiscordStats() {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    if (!guild) return;

    // Count online members (presence intents required)
    await guild.members.fetch(); // fetch all members (may be heavy for large guilds)
    const members = guild.members.cache;
    const onlineCount = members.filter(m => m.presence && m.presence.status !== 'offline').size;

    // Load jobs config for role names
    const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/jobs.json'), 'utf8')).roles || [];

    // Count per role
    const roleCounts = {};
    for (const roleName of jobs) {
      const role = guild.roles.cache.find(r => r.name === roleName);
      if (!role) { roleCounts[roleName] = 0; continue; }
      roleCounts[roleName] = members.filter(m => m.roles.cache.has(role.id) && m.presence && m.presence.status !== 'offline').size;
    }

    // Determine top role
    let topRole = null;
    let topCount = 0;
    for (const [r, c] of Object.entries(roleCounts)) {
      if (c > topCount) { topCount = c; topRole = r; }
    }

    // Update voice channel names if configured
    const channelIdOnline = process.env.STATS_CHANNEL_ID_DISCORD || config.statsChannelOnline;
    const channelIdRole = process.env.STATS_CHANNEL_ID_ROLE || config.statsChannelRole;

    if (channelIdOnline) {
      const ch = await guild.channels.fetch(channelIdOnline).catch(()=>null);
      if (ch && ch.setName) await ch.setName(`จำนวนผู้ออนไลน์: ${onlineCount} คน`).catch(()=>null);
    }
    if (channelIdRole) {
      const ch2 = await guild.channels.fetch(channelIdRole).catch(()=>null);
      if (ch2 && ch2.setName) await ch2.setName(`หน่วยงานที่กำลังทำงาน: ${topRole || '—'} (${topCount})`).catch(()=>null);
    }

  } catch (err) {
    console.error('updateDiscordStats error', err);
  }
}

let statsInterval = null;
function startStatsLoop() {
  // run immediately and then every 30s
  updateDiscordStats();
  statsInterval = setInterval(updateDiscordStats, 30_000);
}

// Export client and utility
module.exports = client;
