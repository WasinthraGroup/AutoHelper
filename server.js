require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

require("./bot"); // start discord bot

app.use("/auth", require("./oauth/discord"));
app.use("/auth", require("./oauth/roblox"));
app.use("/api", require("./routes/classroom"));
app.use("/api", require("./routes/stats"));

app.use(express.static(path.join(__dirname, "../public")));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
