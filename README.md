<div align="center">

  <img src="https://i.imgur.com/nI8BZdQ.png" alt="logo" width="200" height="auto" />
  <h1>Audit Webhook Toggle Bot</h1>
  
<!-- Badges -->
<p>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/hackletloose/hall-audit-webhook-toggle" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/hackletloose/hall-audit-webhook-toggle" alt="last update" />
  </a>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle/network/members">
    <img src="https://img.shields.io/github/forks/hackletloose/hall-audit-webhook-toggle" alt="forks" />
  </a>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle/stargazers">
    <img src="https://img.shields.io/github/stars/hackletloose/hall-audit-webhook-toggle" alt="stars" />
  </a>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle/issues/">
    <img src="https://img.shields.io/github/issues/hackletloose/hall-audit-webhook-toggle" alt="open issues" />
  </a>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/hackletloose/hall-audit-webhook-toggle.svg" alt="license" />
  </a>
</p>
   
<h4>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle">Documentation</a>
  <span> · </span>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle/issues/">Report Bug</a>
  <span> · </span>
  <a href="https://github.com/hackletloose/hall-audit-webhook-toggle/issues/">Request Feature</a>
</h4>
</div>

<br />

# Table of Contents

- [About the Project](#audit-webhook-toggle-bot)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Bot](#running-the-bot)
  - [Local Node.js](#local-nodejs)
  - [Docker](#docker)
- [Discord Bot Setup](#discord-bot-setup)
- [Operational Notes](#operational-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

# Audit Webhook Toggle Bot

A Discord bot that provides a simple interface to enable or disable audit webhooks with a single click, helping avoid Discord rate limits during mass messaging events by toggling webhook configurations via a CRCON server API.

## Features
- Sends an embed with "Aktivieren" (Enable) and "Deaktivieren" (Disable) buttons to a specified Discord channel.
- Displays the current webhook status ("Webhooks: Enabled" or "Webhooks: Disabled") or a warning if the configuration is unavailable.
- Fetches and stores the initial webhook configuration from the CRCON server.
- Enables/disables audit webhooks with one click to prevent rate limiting during mass messaging.
- Includes retry logic for Discord login and robust error handling for API requests.
- Clears the channel of previous messages before sending the control embed.
- Disables buttons when their action is not applicable (e.g., "Enable" disabled when webhooks are active).

## Prerequisites
- Node.js (v16 or higher) for local running, or Docker and Docker Compose for containerized deployment.
- A Discord bot token from the [Discord Developer Portal](https://discord.com/developers/applications).
- Access to a CRCON server with an API key.
- A Discord channel ID where the bot will operate.

## Installation
1. Clone or download this repository:
   ```bash
   git clone https://github.com/hackletloose/hall-audit-webhook-toggle.git
   cd hall-audit-webhook-toggle
   ```
2. For local running, install dependencies:
   ```bash
   npm install
   ```
3. For Docker, ensure Docker and Docker Compose are installed (no additional steps needed).

## Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your values:
   ```
   CRCON_SERVER=https://your-crcon-server.com
   CRCON_API_KEY=your_crcon_api_key
   DISCORD_TOKEN=your_discord_bot_token
   CHANNEL_ID=your_discord_channel_id
   ```
   - `CRCON_SERVER`: URL of your CRCON server (e.g., `https://crcon.example.com`).
   - `CRCON_API_KEY`: API key for CRCON server authentication.
   - `DISCORD_TOKEN`: Discord bot token from the Developer Portal.
   - `CHANNEL_ID`: ID of the Discord channel for the bot’s embed.

## Running the Bot

### Local Node.js
1. Ensure `.env` is configured.
2. Start the bot:
   ```bash
   npm start
   ```
3. The bot will log in, clear the channel, and send an embed with buttons.

### Docker
1. Ensure Docker and Docker Compose are installed.
2. Configure `.env` as above.
3. Rename the docker compose example:
   ```bash
   mv example.docker-compose.yml docker-compose.yml
   ```
4. Build and run the container:
   ```bash
   docker compose up -d
   ```
5. View logs:
   ```bash
   docker compose logs
   ```
6. Stop the container:
   ```bash
   docker compose down
   ```
7. Rebuild after code changes:
   ```bash
   docker compose up -d --build
   ```

## Discord Bot Setup
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Add a bot to the application and copy its token (set as `DISCORD_TOKEN` in `.env`).
3. Enable the following intents under "Bot":
   - Guilds
   - Guild Messages
   - Message Content
4. Invite the bot to your server with the following permissions:
   - View Channel
   - Send Messages
   - Manage Messages
   - Embed Links
   - Read Message History
5. Copy the ID of the target channel and set it as `CHANNEL_ID` in `.env`.

## Operational Notes
- On startup, the bot clears the specified channel and sends an embed with "Aktivieren" (Enable) and "Deaktivieren" (Disable) buttons.
- The embed shows:
  - "Webhooks: Enabled" if webhooks are active.
  - "Webhooks: Disabled" if webhooks are off (e.g., dummy URL or empty config).
  - A warning if the CRCON config fetch fails, advising to restart or check the server.
- Buttons are disabled when their action is redundant (e.g., "Enable" disabled if webhooks are enabled).
- Use the "Deaktivieren" button before mass messaging to avoid Discord rate limits, then "Aktivieren" to restore webhooks.
- Check logs (`docker-compose logs` or console) for errors if the bot fails to start or respond.
- If the warning appears, verify the CRCON server URL and API key, or restart the bot.

## Troubleshooting
- **Bot fails to log in**: Verify `DISCORD_TOKEN` and ensure intents/permissions are enabled in the Developer Portal.
- **API errors**: Check `CRCON_SERVER` and `CRCON_API_KEY`. Ensure the CRCON server is reachable.
- **Channel not found**: Confirm `CHANNEL_ID` is correct and the bot has channel access.
- **Buttons not working**: Ensure the bot has "Manage Messages" and "Embed Links" permissions.
- **Docker issues**: Verify Docker is running, `.env` exists, and no port conflicts occur.
- **Warning in embed**: If the webhook config fetch fails, check CRCON server connectivity or restart the container.

## Contributing
Submit issues or pull requests to improve the bot. Ensure changes are documented and tested.

## License
This project is licensed under the MIT License.
