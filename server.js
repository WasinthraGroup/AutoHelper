// server.js — Express app + middlewares + route wiring
require('dotenv').config();
const express = require('express');
require('express-async-errors'); // handle async errors
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const xss = require('xss-clean');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const app = express();

// Logging (morgan -> winston)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'roblox-discord-bot' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
app.use(morgan('combined'));

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.BASE_URL ? [process.env.BASE_URL] : true,
  credentials: true
}));
app.use(hpp());
app.use(xss());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Ensure data file exists
const dataPath = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({ verifications: [] }, null, 2));

// Start Discord bot (this will export the client)
const client = require('./bot');

// Routes
app.use('/auth/roblox', require('./oauth_roblox'));
app.use('/auth/discord', require('./oauth_discord'));
app.use('/api/classroom', require('./routes_classroom'));
app.use('/api/stats', require('./routes_stats'));

// Serve static privacy/terms
app.use(express.static(path.join(__dirname, 'public')));

// Basic health check
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server listening on ${PORT}`);
});
