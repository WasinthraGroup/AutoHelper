const express = require("express");
const router = express.Router();
const client = require("../bot");
const classrooms = require("../../config/classrooms.json");

router.post("/classroom-update", async (req, res) => {
  const { secret, discordId, classroom } = req.body;

  if (secret !== process.env.API_SECRET)
    return res.status(403).send("Unauthorized");

  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
  const member = await guild.members.fetch(discordId);

  const channelId = classrooms[classroom] || classrooms["Default"];

  await member.voice.setChannel(channelId);

  res.send("Moved");
});

module.exports = router;
