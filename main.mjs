import fetch from 'node-fetch';
import { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const CRCON_SERVER = process.env.CRCON_SERVER;
const CRCON_API_KEY = process.env.CRCON_API_KEY;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!CRCON_API_KEY || !DISCORD_TOKEN || !CHANNEL_ID) {
  throw new Error('Missing required environment variables: CRCON_API_KEY, DISCORD_TOKEN, and CHANNEL_ID are required');
}

console.log('Environment variables loaded:');
console.log('DISCORD_TOKEN:', DISCORD_TOKEN ? 'Loaded' : 'Not loaded');
console.log('CRCON_SERVER:', CRCON_SERVER);
console.log('CRCON_API_KEY:', CRCON_API_KEY ? 'Loaded' : 'Not loaded');
console.log('CHANNEL_ID:', CHANNEL_ID);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

let botMessageId = null;
let originalWebhookConfig = null;

async function getAuditWebhooksConfig() {
  try {
    const response = await fetch(`${CRCON_SERVER}/api/get_audit_discord_webhooks_config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRCON_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.failed || !data.result) {
      throw new Error(`API error: ${data.error || 'Invalid response format'}`);
    }

    console.log('Fetched webhook config:', data.result);
    return data.result;
  } catch (error) {
    console.error('Error fetching audit webhooks config:', error.message);
    throw error;
  }
}

async function setAuditWebhooksConfig(config, by = 'DiscordBot') {
  try {
    const response = await fetch(`${CRCON_SERVER}/api/set_audit_discord_webhooks_config`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRCON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        by,
        config,
        reset_to_default: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
    }

    const result = await response.json();
    if (result.failed) {
      throw new Error(`API error: ${result.error || 'Failed to set config'}`);
    }

    console.log('Set webhook config result:', result);
    return result;
  } catch (error) {
    console.error('Error setting audit webhooks config:', error.message);
    throw error;
  }
}

async function updateEmbedAndButtons(channel) {
  try {
    const currentConfig = await getAuditWebhooksConfig();

    const embed = new EmbedBuilder()
      .setTitle('Audit Webhook Start/Stop')
      .setColor('#0099ff')
      .setTimestamp();

    let statusMessage = '';
    let isConfigValid = currentConfig && currentConfig.hooks && currentConfig.hooks.length > 0;

    if (!currentConfig || !currentConfig.hooks) {
      statusMessage = '⚠️ Warning: Webhook configuration unavailable. Please restart the bot or check CRCON server.';
      embed.setColor('#ff0000');
    } else if (currentConfig.hooks.length === 0 || currentConfig.hooks[0].url === 'https://discord.com/') {
      statusMessage = 'Webhook: Disabled';
    } else {
      statusMessage = 'Webhook: Enabled';
    }

    embed.addFields({ name: 'Status', value: statusMessage });

    const enableButton = new ButtonBuilder()
      .setCustomId('enable_audit')
      .setLabel('Enable')
      .setStyle(ButtonStyle.Success)
      .setDisabled(currentConfig.hooks[0]?.url !== 'https://discord.com/' && isConfigValid);

    const disableButton = new ButtonBuilder()
      .setCustomId('disable_audit')
      .setLabel('Disable')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!isConfigValid || currentConfig.hooks[0]?.url === 'https://discord.com/');

    const row = new ActionRowBuilder().addComponents(enableButton, disableButton);

    const message = await channel.messages.fetch(botMessageId);
    await message.edit({ embeds: [embed], components: [row] });
    console.log('Embed and buttons updated');
  } catch (error) {
    console.error('Error updating embed and buttons:', error.message);
    throw error;
  }
}

async function loginWithRetry(client, token, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Login attempt ${i + 1}`);
      await client.login(token);
      console.log('Login successful');
      return;
    } catch (error) {
      console.error(`Login attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    try {
      originalWebhookConfig = await getAuditWebhooksConfig();
    } catch (error) {
      console.error('Failed to fetch webhook config on startup, continuing without it:', error.message);
      originalWebhookConfig = null;
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel.isTextBased()) {
      throw new Error('Specified channel is not a text channel');
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    await channel.bulkDelete(messages, true);
    console.log('Channel cleared');

    const embed = new EmbedBuilder()
      .setTitle('Audit Webhook Start/Stop')
      .setColor('#0099ff')
      .setTimestamp();

    let statusMessage = '';
    let isConfigValid = originalWebhookConfig && originalWebhookConfig.hooks && originalWebhookConfig.hooks.length > 0;

    if (!originalWebhookConfig || !originalWebhookConfig.hooks) {
      statusMessage = '⚠️ Warning: Webhook configuration unavailable. Please restart the bot or check CRCON server.';
      embed.setColor('#ff0000'); // Red for warning
    } else if (originalWebhookConfig.hooks.length === 0 || originalWebhookConfig.hooks[0].url === 'https://discord.com/') {
      statusMessage = 'Webhook: Disabled';
    } else {
      statusMessage = 'Webhook: Enabled';
    }

    embed.addFields({ name: 'Status', value: statusMessage });

    const enableButton = new ButtonBuilder()
      .setCustomId('enable_audit')
      .setLabel('Enable')
      .setStyle(ButtonStyle.Success)
      .setDisabled(originalWebhookConfig?.hooks[0]?.url !== 'https://discord.com/' && isConfigValid);

    const disableButton = new ButtonBuilder()
      .setCustomId('disable_audit')
      .setLabel('Disable')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!isConfigValid || originalWebhookConfig?.hooks[0]?.url === 'https://discord.com/');

    const row = new ActionRowBuilder().addComponents(enableButton, disableButton);

    const sentMessage = await channel.send({ embeds: [embed], components: [row] });
    botMessageId = sentMessage.id;
    console.log('Embed with buttons sent, message ID stored:', botMessageId);
  } catch (error) {
    console.error('Error setting up channel:', error.message);
    process.exit(1);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.message.id !== botMessageId) return;

  if (!['enable_audit', 'disable_audit'].includes(interaction.customId)) return;

  await interaction.deferReply({ flags: 64 });

  try {
    const channel = interaction.channel;
    if (interaction.customId === 'enable_audit') {
      if (!originalWebhookConfig) {
        throw new Error('Webhook configuration not available. Please restart the bot.');
      }
      await setAuditWebhooksConfig(originalWebhookConfig, interaction.user.tag);
      await interaction.editReply({ content: 'Audit webhook enabled successfully!', flags: 64 });
      await updateEmbedAndButtons(channel);
    } else if (interaction.customId === 'disable_audit') {
      const disableConfig = {
        hooks: [
          {
            url: 'https://discord.com/',
          },
        ],
      };
      await setAuditWebhooksConfig(disableConfig, interaction.user.tag);
      await interaction.editReply({ content: 'Audit webhook disabled successfully!', flags: 64 });
      await updateEmbedAndButtons(channel);
    }
  } catch (error) {
    console.error(`Error handling ${interaction.customId}:`, error.message);
    await interaction.editReply({ content: `Error: ${error.message}`, flags: 64 });
  }
});

loginWithRetry(client, DISCORD_TOKEN).catch((error) => {
  console.error('Failed to login to Discord:', error.message);
  process.exit(1);
});

export { getAuditWebhooksConfig, setAuditWebhooksConfig };
