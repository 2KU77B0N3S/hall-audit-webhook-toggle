# Audit Webhook Toggle Bot

A Discord bot that provides a simple interface to enable or disable audit webhooks with a single click, helping avoid Discord rate limits during mass messaging events by toggling webhook configurations via a CRCON server API.

## Features
- Sends an embed with "Enable" and "Disable" buttons to a specified Discord channel.
- Fetches and stores the initial webhook configuration from the CRCON server.
- Allows enabling/disabling audit webhooks with one click to prevent rate limiting during mass messaging.
- Includes retry logic for Discord login and error handling for API requests.
- Clears the channel of previous messages before sending the control embed.

## Prerequisites
- Node.js (v16 or higher recommended)
- A Discord bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
- Access to a CRCON server with an API key
- A Discord channel ID where the bot will operate

## Installation
1. Clone or download this repository.
2. Navigate to the project directory:
   ```bash
   cd audit-webhook-toggle-bot
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

## Environment Variables
Create a `.env` file in the project root with the following variables:

```
CRCON_SERVER=https://your-crcon-server.com
CRCON_API_KEY=your_crcon_api_key
DISCORD_TOKEN=your_discord_bot_token
CHANNEL_ID=your_discord_channel_id
```

- `CRCON_SERVER`: The URL of your CRCON server (e.g., `https://crcon.example.com`).
- `CRCON_API_KEY`: The API key for authenticating with the CRCON server.
- `DISCORD_TOKEN`: The Discord bot token from the Discord Developer Portal.
- `CHANNEL_ID`: The ID of the Discord channel where the bot will send the control embed.

## Usage
1. Ensure your `.env` file is correctly configured.
2. Start the bot:
   ```bash
   npm start
   ```
3. The bot will:
   - Log in to Discord.
   - Clear the specified channel of previous messages.
   - Send an embed with "Aktivieren" (Enable) and "Deaktivieren" (Disable) buttons.
4. Interact with the buttons:
   - **Enable**: Restores the original webhook configuration fetched on startup.
   - **Disable**: Sets a dummy webhook URL (`https://discord.com/`) to disable audit webhooks.
5. The bot will respond with a confirmation or error message for each button interaction.

## Project Structure
- `main.mjs`: The main bot script that handles Discord interactions and CRCON API calls.
- `package.json`: Defines project dependencies and scripts.
- `.env.example`: A template for the environment variables file.
- `.gitignore`: Excludes sensitive and unnecessary files from version control.

## Dependencies
- `discord.js`: For interacting with the Discord API.
- `node-fetch`: For making HTTP requests to the CRCON server.
- `dotenv`: For loading environment variables from a `.env` file.

## Troubleshooting
- **Bot fails to log in**: Check your `DISCORD_TOKEN` and ensure the bot has the necessary permissions.
- **API errors**: Verify the `CRCON_SERVER` URL and `CRCON_API_KEY`. Ensure the CRCON server is accessible.
- **Channel not found**: Confirm the `CHANNEL_ID` is correct and the bot has access to the channel.
- **Buttons not working**: Ensure the bot has permissions to manage messages and embed links in the channel.

## Contributing
Feel free to submit issues or pull requests to improve the bot. Ensure any changes are well-documented and tested.

## License
This project is licensed under the MIT License.
