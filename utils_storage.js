// utils_storage.js — minimal JSON storage wrapper (data.json)
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'data.json');

function read() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { verifications: [] };
  }
}

function write(obj) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

function addVerification(v) {
  const data = read();
  data.verifications = data.verifications || [];
  data.verifications.push(v);
  write(data);
}

function saveVerificationState(state) {
  // Append to a list for history - keep lightweight
  addVerification(state);
}

module.exports = {
  read,
  write,
  addVerification,
  saveVerificationState
};
