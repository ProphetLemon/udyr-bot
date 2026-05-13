require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadLolChampions, loadLaneChampions } = require('./lib/lolData');
const { destroyAllQueues } = require('./lib/queueManager');
const { shutdown: shutdownUggBrowser } = require('./lib/uggBrowser');
const { storeMessage: storeChatMsg, cacheMember } = require('./commands/chat');

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
        GatewayIntentBits.GuildMembers,
    ],
});

client.once('ready', async () => {
    console.log(`[READY] Bot conectado como ${client.user.tag}`);
    loadLolChampions().then(() => loadLaneChampions());

    try {
        const channel = client.channels.cache.get(ALLOWED_CHANNEL_ID);
        if (channel) {
            const msgs = await channel.messages.fetch({ limit: 10 });
            const sorted = Array.from(msgs.values()).reverse();
            for (const m of sorted) {
                if (m.author.bot) continue;
                const name = m.member?.displayName || m.author.username;
                storeChatMsg(ALLOWED_CHANNEL_ID, 'user', `${name}: ${m.content}`);
            }
            console.log(`[CHAT] ${sorted.filter(m => !m.author.bot).length} mensajes cargados como contexto inicial`);
        }
    } catch (e) {
        console.log('[CHAT] No se pudo cargar contexto inicial:', e.message);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.guildId !== ALLOWED_GUILD_ID) return;
    if (message.channelId !== ALLOWED_CHANNEL_ID) return;

    const name = message.member?.displayName || message.author.username;
    cacheMember(message.member);
    storeChatMsg(ALLOWED_CHANNEL_ID, 'user', `${name}: ${message.content}`);

    if (message.content.toLowerCase().startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        const handler = handlers[command];
        if (handler) {
            try {
                await handler(message, args);
            } catch (err) {
                console.error(`[CMD:${command}] error:`, err.stack || err.message);
                message.reply('Ocurrio un error inesperado al ejecutar ese comando.').catch(() => {});
            }
            return;
        }
    }

    try {
        await handlers.chat(message, message.content.split(/ +/));
    } catch (err) {
        console.error('[CMD:chat] error:', err.stack || err.message);
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
