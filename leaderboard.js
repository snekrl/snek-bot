const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'leaderboard.json');

function loadLeaderboard() {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading leaderboard:', err);
    return [];
  }
}

function saveLeaderboard(leaderboard) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving leaderboard:', err);
  }
}

function addOrUpdatePlayer(player) {
  const leaderboard = loadLeaderboard();
  const existing = leaderboard.find(p => p.username === player.username && p.platform === player.platform);

  if (existing) {
    Object.assign(existing, player);
  } else {
    leaderboard.push(player);
  }

  saveLeaderboard(leaderboard);
}

function removePlayer(username, platform) {
  let leaderboard = loadLeaderboard();
  leaderboard = leaderboard.filter(p => !(p.username === username && p.platform === platform));
  saveLeaderboard(leaderboard);
}

module.exports = {
  loadLeaderboard,
  saveLeaderboard,
  addOrUpdatePlayer,
  removePlayer
};
