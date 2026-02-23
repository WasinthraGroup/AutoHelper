// oauth_discord.js — (optional) Discord OAuth example (not required for bot token)
// This route is minimal — you can expand to actually link Discord user accounts to app sessions.
const express = require('express');
const router = express.Router();
const axios = require('axios');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

router.get('/', (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(BASE_URL + '/auth/discord/callback')}&response_type=code&scope=identify`;
  res.redirect(redirect);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // Exchange code for token (server-to-server)
    const params = new URLSearchParams();
    params.append('client_id', process.env.DISCORD_CLIENT_ID);
    params.append('client_secret', process.env.DISCORD_CLIENT_SECRET || '');
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `${BASE_URL}/auth/discord/callback`);
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    res.send(`<h2>Discord linked: ${userRes.data.username}#${userRes.data.discriminator}</h2>`);
  } catch (err) {
    console.error('discord oauth error', err.response ? err.response.data : err);
    res.status(500).send('Discord OAuth failed');
  }
});

module.exports = router;
