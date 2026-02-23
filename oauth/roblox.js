const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/roblox", (req, res) => {
  const redirect = `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.ROBLOX_CLIENT_ID}&redirect_uri=${process.env.BASE_URL}/auth/roblox/callback&response_type=code&scope=openid profile`;
  res.redirect(redirect);
});

router.get("/roblox/callback", async (req, res) => {
  const { code } = req.query;

  const tokenRes = await axios.post(
    "https://apis.roblox.com/oauth/v1/token",
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.BASE_URL}/auth/roblox/callback`,
      client_id: process.env.ROBLOX_CLIENT_ID,
      client_secret: process.env.ROBLOX_CLIENT_SECRET
    }
  );

  res.send("Roblox Linked Successfully");
});

module.exports = router;
