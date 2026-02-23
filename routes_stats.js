// routes_stats.js — endpoints to pull current stats (discord + roblox)
const express = require('express');
const router = express.Router();
const client = require('./bot');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// GET /api/stats/discord -> { online: n, topRole: {name, count} }
router.get('/discord', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    await guild.members.fetch();
    const members = guild.members.cache;
    const onlineCount = members.filter(m => m.presence && m.presence.status !== 'offline').size;

    const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/jobs.json'))).roles || [];
    let topRole = { name: null, count: 0 };
    for (const rname of jobs) {
      const role = guild.roles.cache.find(r => r.name === rname);
      const c = role ? members.filter(m => m.roles.cache.has(role.id) && m.presence && m.presence.status !== 'offline').size : 0;
      if (c > topRole.count) topRole = { name: rname, count: c };
    }

    res.json({ online: onlineCount, topRole });
  } catch (err) {
    console.error('stats discord err', err);
    res.status(500).json({ error: 'internal' });
  }
});

// GET /api/stats/roblox?universeId=12345
router.get('/roblox', async (req, res) => {
  // This endpoint optionally queries Roblox games to get server player count.
  // For a simple implementation we expect the client to pass player count or
  // your Roblox game can POST to /api/classroom/players to update counts.
  res.json({ message: 'Use /api/stats/roblox with a reporting mechanism from the Roblox game' });
});

module.exports = router;
