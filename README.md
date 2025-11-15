# Snek bot

Snek bot is a Discord bot that fetches player stats and manages private leaderboards. The bot interacts with a separate R6 API repository to fetch live in game stats.

## Features

- Lookup R6 stats via /r6stats.

- Register players for a custom server leaderboard via /r6register.

- View the server leaderboard via /r6_leaderboard.

## Requirements

Node.js v18+

npm

Discord bot token

Running R6 API proxy

## Setup

### 1. Clone the repo:

git clone <r6-bot-repo-url>
cd <repo-directory>


### 2. Install dependencies:

npm install discord.js axios dotenv


### 3. Add .env with your bot token:

DISCORD_TOKEN=your-bot-token


### 4. Start the bot:

node index.js

## Commands

/r6stats – Look up a user’s R6 ranked stats.
Options: platform (PC/Xbox/PSN), username

/r6register – Add a user to the server leaderboard.
Options: platform, username

/r6_leaderboard – Show the server leaderboard.

## Leaderboard

Uses in game RP to rank players.

Data stored in leaderboard.json.

Only registered players appear on the leaderboard.

Updated when users register themselves using /r6register.
