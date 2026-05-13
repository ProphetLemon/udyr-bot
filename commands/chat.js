const axios = require('axios');

const API_URL = 'https://opencode.ai/zen/go/v1/chat/completions';
const MODEL = 'deepseek-v4-flash';
const TIMEOUT_MS = 60000;
const MAX_HISTORY = 100;

const SYSTEM_PROMPT = `Eres Udyr, un bot de Discord que vive en un chat de amigos. Los mensajes te llegan con el formato "<nombre>: <mensaje>". Responde como un amigo más del grupo: natural, informal, ocurrente. Puedes usar el lenguaje que te dé la gana — groserías, sarcasmo, humor negro, lo que encaje. Aquí no hay filtros ni modo políticamente correcto. Sé breve si el mensaje es de coña, extiéndete solo si la pregunta lo merece. Responde siempre en español.

Puedes ejecutar acciones de moderación de broma añadiendo comandos AL FINAL de tu respuesta. Úsalos con criterio — solo cuando sea gracioso o merecido. Los comandos disponibles son:

!!timeout @usuario <segundos> — Silencia a alguien unos segundos (máx 60)
!!untimeout @usuario — Le quita el silencio

El comando no se mostrará en el chat, solo se ejecutará. No abuses.`;

const conversations = new Map();

function getHistory(channelId) {
    if (!conversations.has(channelId)) {
        conversations.set(channelId, []);
    }
    return conversations.get(channelId);
}

function storeMessage(channelId, role, content) {
    const history = getHistory(channelId);
    history.push({ role, content });
    if (history.length > MAX_HISTORY) {
        history.splice(0, history.length - MAX_HISTORY);
    }
}

function parseCommands(text) {
    const commands = [];
    const re = /!!(timeout|untimeout)\s+<@!?(\d+)>\s*(\d+)?/gi;
    let clean = text;
    let match;
    while ((match = re.exec(text)) !== null) {
        commands.push({ action: match[1].toLowerCase(), userId: match[2], seconds: parseInt(match[3]) || 0 });
        clean = clean.replace(match[0], '');
    }
    return { commands, clean: clean.replace(/\n{3,}/g, '\n\n').trim() };
}

async function executeCommands(message, commands) {
    for (const cmd of commands) {
        try {
            const member = await message.guild.members.fetch(cmd.userId).catch(() => null);
            if (!member) continue;

            if (cmd.action === 'timeout') {
                const secs = Math.min(Math.max(cmd.seconds || 10, 1), 60);
                await member.timeout(secs * 1000, `Udyr chat: timeout de ${secs}s`).catch(() => {});
            } else if (cmd.action === 'untimeout') {
                await member.timeout(null, 'Udyr chat: quitar timeout').catch(() => {});
            }
        } catch (e) {
            console.debug('[CHAT] error ejecutando comando:', cmd.action, e.message);
        }
    }
}

module.exports = async function handleChat(message, args) {
    const channelId = message.channel.id;

    if (args[0]?.toLowerCase() === 'reset') {
        conversations.delete(channelId);
        return message.reply('🧹 Historial del chat borrado. Empezamos de cero.');
    }

    const query = args.join(' ').trim();
    if (!query) {
        return message.reply('Escribe algo. Ejemplo: `udyr chat explicame que es una closure en JS`');
    }

    const apiKey = process.env.OPENCODE_API_KEY;
    if (!apiKey) {
        return message.reply('Falta `OPENCODE_API_KEY` en el `.env`. Añade tu API key de OpenCode Zen.');
    }

    const username = message.member?.displayName || message.author.username;
    const userMessage = `${username}: ${query}`;
    // El mensaje ya fue almacenado por index.js
    const history = getHistory(channelId);

    const loading = await message.reply('🤔 Pensando...');

    try {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...getHistory(channelId).slice(-MAX_HISTORY),
        ];

        const res = await axios.post(API_URL, {
            model: MODEL,
            messages,
            max_tokens: 4096,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: TIMEOUT_MS,
        });

        const output = res.data?.choices?.[0]?.message?.content?.trim();

        if (!output) {
            console.error('[CHAT] respuesta vacia:', JSON.stringify(res.data).slice(0, 300));
            getHistory(channelId).pop();
            return loading.edit('❌ El modelo no devolvió respuesta.').catch(() => {});
        }

        const { commands, clean } = parseCommands(output);

        storeMessage(channelId, 'assistant', clean);

        if (commands.length > 0) {
            executeCommands(message, commands);
        }

        const finalText = clean.length > 1990 ? clean.slice(0, 1950) + '...' : clean || '❌';

        return loading.edit(finalText).catch(() => {});
    } catch (err) {
        getHistory(channelId).pop();

        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;
        console.error(`[CHAT] error HTTP ${status}:`, msg);

        if (status === 401 || status === 403) {
            return loading.edit('🔑 API key inválida. Revisa `OPENCODE_API_KEY` en tu `.env`.').catch(() => {});
        }
        if (err.code === 'ECONNABORTED') {
            return loading.edit('⏰ El modelo tardó demasiado. Intenta con un mensaje más corto.').catch(() => {});
        }

        return loading.edit('❌ Error al consultar el modelo.').catch(() => {});
    }
};

module.exports.storeMessage = storeMessage;
module.exports.getHistory = getHistory;
