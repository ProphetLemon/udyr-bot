require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadLolChampions, loadLaneChampions } = require('./lib/lolData');
const { destroyAllQueues } = require('./lib/queueManager');
const { shutdown: shutdownUggBrowser } = require('./lib/uggBrowser');

if (!process.env.DISCORD_TOKEN) {
    console.error('[FATAL] Falta DISCORD_TOKEN en .env');
    process.exit(1);
}

const PREFIX = 'udyr';
const ALLOWED_GUILD_ID = 'REDACTED_GUILD_ID';
const ALLOWED_CHANNEL_ID = 'REDACTED_CHANNEL_ID';

const handlers = {
    yt: require('./commands/yt'),
    pause: require('./commands/pause'),
    resume: require('./commands/resume'),
    skip: require('./commands/skip'),
    stop: require('./commands/stop'),
    queue: require('./commands/queue'),
    clean: require('./commands/clean'),
    lol: require('./commands/lol'),
    retar: require('./commands/duel'),
    ruleta: require('./commands/ruleta'),
    blackjack: require('./commands/blackjack'),
    ppt: require('./commands/ppt'),
    dados: require('./commands/dados'),
    mayor: require('./commands/mayormenor'),
    carrera: require('./commands/carrera'),
    conecta4: require('./commands/conecta4'),
    ajedrez: require('./commands/ajedrez'),
    chat: require('./commands/chat'),
};
handlers.help = require('./commands/help');
handlers.h = handlers.help;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.once('ready', () => {
    console.log(`[READY] Bot conectado como ${client.user.tag}`);
    loadLolChampions().then(() => loadLaneChampions());
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.guildId !== ALLOWED_GUILD_ID) return;
    if (message.channelId !== ALLOWED_CHANNEL_ID) return;
    if (!message.content.toLowerCase().startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    const handler = handlers[command];
    if (!handler) return;

    try {
        await handler(message, args);
    } catch (err) {
        console.error(`[CMD:${command}] error:`, err.stack || err.message);
        message.reply('Ocurrio un error inesperado al ejecutar ese comando.').catch(() => {});
    }
});

let shuttingDown = false;
async function gracefulShutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[SHUTDOWN] Recibido ${signal}, cerrando...`);
    destroyAllQueues();
    await shutdownUggBrowser().catch(() => {});
    try { await client.destroy(); } catch {}
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught exception:', err.stack || err.message);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled rejection:', reason?.stack || reason);
    gracefulShutdown('unhandledRejection');
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
    console.error('[FATAL] login fallo:', err.message);
    process.exit(1);
});
