const axios = require('axios');

const API_URL = 'https://opencode.ai/zen/go/v1/chat/completions';
const MODEL = 'deepseek-v4-flash';
const TIMEOUT_MS = 60000;
const MAX_HISTORY = 100;

const SYSTEM_PROMPT = `Eres Udyr, un bot de Discord que vive en un chat de amigos. Los mensajes te llegan con el formato "<nombre>: <mensaje>". Responde como un amigo más del grupo: natural, informal, ocurrente. Puedes usar el lenguaje que te dé la gana — groserías, sarcasmo, humor negro, lo que encaje. Aquí no hay filtros ni modo políticamente correcto. Sé breve si el mensaje es de coña, extiéndete solo si la pregunta lo merece. Responde siempre en español de España (castellano): usa "vosotros", "hostia", "tío", "vale", "molar", "flipar" y expresiones propias de la península. Nada de "ustedes", "wey", "chévere" ni localismos latinos.

El bot Udyr tiene los siguientes comandos, que los usuarios pueden usar escribiendo "udyr <comando>". Tú no puedes ejecutarlos, solo los usuarios. Conócelos para mencionarlos cuando sea relevante:

udyr yt <url/búsqueda> — Reproduce música de YouTube en el canal de voz
udyr pause/resume/skip/stop/queue — Control de reproducción de música
udyr clean <num> — Borra mensajes del chat
udyr lol <campeón> <línea> — Muestra builds de League of Legends
udyr lol equipo — Asigna personajes aleatorios a la gente en voz
udyr retar @usuario — Duelo por turnos con clases y pasivas RPG
udyr ruleta — Tragaperras de frutas con patrones y multiplicadores
udyr blackjack — Blackjack contra el dealer (reacciones)
udyr ppt @usuario — Piedra, papel o tijera 1v1
udyr dados — Craps: tira los dados contra la casa
udyr mayor — Mayor o menor: adivina la siguiente carta
udyr carrera — Apuesta a caballos, carrera animada
udyr conecta4 @usuario — Conecta 4 por turnos
udyr ajedrez @usuario — Ajedrez 1v1, notación algebraica
udyr chat reset — Borra el historial de la conversación
udyr help — Muestra todos los comandos

Tú también tienes comandos ocultos al final de tus respuestas:
!!timeout @nombre <segundos> — Silencia a alguien unos segundos (máx 60)
!!untimeout @nombre — Le quita el silencio
!!react <emoji> — Reacciona al mensaje del usuario con ese emoji`;

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
    const re = /!!(timeout|untimeout|react)\s+(.+?)(?=\s*!!|$)/gs;
    let clean = text;
    let match;
    while ((match = re.exec(text)) !== null) {
        const action = match[1].toLowerCase();
        const raw = match[2].trim();
        if (action === 'react') {
            commands.push({ action: 'react', emoji: raw });
        } else {
            const mentionMatch = raw.match(/^<@!?(\d+)>\s*(\d+)?$/);
            if (mentionMatch) {
                commands.push({ action, userId: mentionMatch[1], seconds: parseInt(mentionMatch[2]) || 0 });
            } else {
                const nameMatch = raw.match(/^@?(.+?)\s*(\d+)?$/);
                if (nameMatch) {
                    commands.push({ action, name: nameMatch[1].trim(), seconds: parseInt(nameMatch[2]) || 0 });
                }
            }
        }
        clean = clean.replace(match[0], '');
    }
    return { commands, clean: clean.replace(/\n{3,}/g, '\n\n').trim() };
}

const membersByName = new Map();

function cacheMember(member) {
    if (!member) return;
    const name = member.displayName.toLowerCase();
    membersByName.set(name, member);
    membersByName.set(member.user.username.toLowerCase(), member);
    membersByName.set(member.id, member);
}

async function resolveMember(guild, target) {
    if (target.userId) {
        console.log(`[CHAT] resolveMember por ID: ${target.userId}`);
        const cached = membersByName.get(target.userId);
        if (cached) return cached;
        return guild.members.fetch(target.userId).catch(() => null);
    }
    if (target.name) {
        const needle = target.name.toLowerCase();
        console.log(`[CHAT] resolveMember por nombre: "${target.name}" (busqueda: "${needle}")`);
        const exact = membersByName.get(needle);
        if (exact) { console.log(`[CHAT] encontrado exacto: ${exact.displayName}`); return exact; }
        let best = null;
        for (const [key, member] of membersByName) {
            if (key.includes(needle)) { best = member; console.log(`[CHAT] encontrado parcial: ${key} -> ${member.displayName}`); break; }
        }
        if (best) return best;
        console.log(`[CHAT] no encontrado en cache (${membersByName.size} miembros), probando fetch...`);
        const fetched = await guild.members.fetch({ query: target.name, limit: 5 }).catch((e) => { console.log(`[CHAT] fetch fallo:`, e.message); return null; });
        if (fetched?.size) {
            const found = fetched.find((m) =>
                m.displayName.toLowerCase().includes(needle) ||
                m.user.username.toLowerCase().includes(needle)
            );
            if (found) { console.log(`[CHAT] encontrado via fetch: ${found.displayName}`); cacheMember(found); return found; }
        }
        console.log(`[CHAT] miembro no encontrado por ningun metodo`);
    }
    return null;
}

async function resolveMember(guild, target) {
    if (target.userId) {
        const cached = membersByName.get(target.userId);
        if (cached) return cached;
        return guild.members.fetch(target.userId).catch(() => null);
    }
    if (target.name) {
        const needle = target.name.toLowerCase();
        const exact = membersByName.get(needle);
        if (exact) return exact;
        let best = null;
        for (const [key, member] of membersByName) {
            if (key.includes(needle)) { best = member; break; }
        }
        if (best) return best;
        const fetched = await guild.members.fetch({ query: target.name, limit: 5 }).catch(() => null);
        if (fetched?.size) {
            const found = fetched.find((m) =>
                m.displayName.toLowerCase().includes(needle) ||
                m.user.username.toLowerCase().includes(needle)
            );
            if (found) { cacheMember(found); return found; }
        }
    }
    return null;
}

async function executeCommands(message, commands) {
    for (const cmd of commands) {
        try {
            if (cmd.action === 'react') {
                console.log(`[CHAT] ejecutando react: ${cmd.emoji}`);
                await message.react(cmd.emoji).catch(() => {});
                continue;
            }

            console.log(`[CHAT] buscando miembro para ${cmd.action}:`, JSON.stringify(cmd));
            const member = await resolveMember(message.guild, cmd);
            if (!member) {
                console.log(`[CHAT] miembro no encontrado:`, cmd.name || cmd.userId);
                continue;
            }
            console.log(`[CHAT] miembro encontrado: ${member.displayName} (${member.id})`);

            if (cmd.action === 'timeout') {
                const secs = Math.min(Math.max(cmd.seconds || 10, 1), 60);
                console.log(`[CHAT] aplicando timeout de ${secs}s a ${member.displayName}`);
                await member.timeout(secs * 1000, `Udyr chat: timeout de ${secs}s`);
                console.log(`[CHAT] timeout aplicado OK`);
            } else if (cmd.action === 'untimeout') {
                console.log(`[CHAT] quitando timeout a ${member.displayName}`);
                await member.timeout(null, 'Udyr chat: quitar timeout');
                console.log(`[CHAT] untimeout aplicado OK`);
            }
        } catch (e) {
            console.error(`[CHAT] error ejecutando ${cmd.action}:`, e.message);
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
            reasoning_effort: 'max',
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

        console.log('[CHAT] respuesta IA:', output.slice(0, 200));
        const { commands, clean } = parseCommands(output);
        console.log('[CHAT] comandos detectados:', JSON.stringify(commands));

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
module.exports.cacheMember = cacheMember;
