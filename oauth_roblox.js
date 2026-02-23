// oauth_roblox.js — simple Roblox OAuth handlers
const express = require('express');
const router = express.Router();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CLIENT_ID = process.env.ROBLOX_CLIENT_ID;
const CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET;

router.get('/', (req, res) => {
  // Redirect user to Roblox authorize page
  const state = req.query.state || ''; // you may want to add anti-forgery in production
  const redirect = `https://apis.roblox.com/oauth/v1/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(BASE_URL + '/auth/roblox/callback')}&response_type=code&scope=openid profile&state=${encodeURIComponent(state)}`;
  res.redirect(redirect);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post('https://apis.roblox.com/oauth/v1/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${BASE_URL}/auth/roblox/callback`,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });

    // tokenRes.data includes access_token, id_token, etc.
    // For simplicity we just show success and instruct user to close window
    res.send(`<h2>Roblox linked successfully</h2><p>คุณสามารถปิดหน้านี้ได้แล้ว</p>`);
  } catch (err) {
    console.error('roblox oauth error', err.response ? err.response.data : err);
    res.status(500).send('OAuth token exchange failed');
  }
});

module.exports = router;
