// routes_classroom.js
// Endpoint intended to be called from Roblox server scripts when a player enters/exits a classroom zone
const express = require('express');
const router = express.Router();
const client = require('./bot');
const storage = require('./utils_storage');
const config = require('./config/classrooms.json');

// Expected payload:
// {
//   "api_secret": "...",
//   "discordId": "123456789012345678",
//   "robloxId": 987654,
//   "robloxUsername": "PlayerName",
//   "classroom": "Classroom201",
//   "inClass": true
// }

router.post('/update', async (req, res) => {
  try {
    const body = req.body;
    if (!body || body.api_secret !== process.env.API_SECRET) return res.status(403).json({ error: 'unauthorized' });

    const { discordId, classroom, inClass } = body;
    if (!discordId || !classroom) return res.status(400).json({ error: 'missing parameters' });

    // find target voice channel from config
    const channelId = config[classroom] || config['Default'];
    if (!channelId) return res.status(404).json({ error: 'no channel configured' });

    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const member = await guild.members.fetch(discordId).catch(()=>null);
    if (!member) return res.status(404).json({ error: 'member not found' });

    // Move member to channel or default
    const target = inClass ? channelId : (config['Default'] || channelId);
    await member.voice.setChannel(target).catch(err => {
      console.error('move error', err);
    });

    // Optionally store state for stats
    const data = storage.read();
    storage.saveVerificationState({
      discordId, classroom, inClass, timestamp: Date.now()
    });

    return res.json({ ok: true, movedTo: target });
  } catch (err) {
    console.error('classroom update error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
