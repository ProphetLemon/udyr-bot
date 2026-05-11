require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadLolChampions, loadLaneChampions } = require('./lib/lolData');

const handleYt = require('./commands/yt');
const handlePause = require('./commands/pause');
const handleResume = require('./commands/resume');
const handleSkip = require('./commands/skip');
const handleStop = require('./commands/stop');
const handleQueue = require('./commands/queue');
const handleHelp = require('./commands/help');
const handleClean = require('./commands/clean');
const handleLol = require('./commands/lol');
const handleDuel = require('./commands/duel');

const prefix = 'udyr';
const ALLOWED_GUILD_ID = 'REDACTED_GUILD_ID';
const ALLOWED_CHANNEL_ID = 'REDACTED_CHANNEL_ID';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once('clientReady', () => {
    console.log(`[READY] Bot conectado como ${client.user.tag}`);
    loadLolChampions().then(() => loadLaneChampions());
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.guildId !== ALLOWED_GUILD_ID) return;
    if (message.channelId !== ALLOWED_CHANNEL_ID) return;
    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (command === 'yt') {
        return handleYt(message, args);
    }
    if (command === 'pause') {
        return handlePause(message);
    }
    if (command === 'resume') {
        return handleResume(message);
    }
    if (command === 'skip') {
        return handleSkip(message);
    }
    if (command === 'stop') {
        return handleStop(message);
    }
    if (command === 'queue') {
        return handleQueue(message);
    }
    if (command === 'help' || command === 'h') {
        return handleHelp(message);
    }
    if (command === 'clean') {
        return handleClean(message, args);
    }
    if (command === 'lol') {
        return handleLol(message, args);
    }
    if (command === 'retar') {
        return handleDuel(message, args);
    }
});

client.login(process.env.DISCORD_TOKEN);
