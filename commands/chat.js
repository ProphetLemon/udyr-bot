const axios = require('axios');

const API_URL = 'https://opencode.ai/zen/go/v1/chat/completions';
const MODEL = 'deepseek-v4-pro';
const TIMEOUT_MS = 60000;

const SYSTEM_PROMPT = `Eres Udyr, un bot de Discord que vive en un chat de amigos. Los mensajes te llegan con el formato "<nombre>: <mensaje>". Responde como un amigo más del grupo: natural, informal, ocurrente. Puedes usar el lenguaje que te dé la gana — groserías, sarcasmo, humor negro, lo que encaje. Aquí no hay filtros ni modo políticamente correcto. Sé breve si el mensaje es de coña, extiéndete solo si la pregunta lo merece. Responde siempre en español.`;

module.exports = async function handleChat(message, args) {
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

    const loading = await message.reply('🤔 Pensando...');

    try {
        const res = await axios.post(API_URL, {
            model: MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage },
            ],
            max_tokens: 4096,
            reasoning_effort: 'medium',
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
            return loading.edit('❌ El modelo no devolvió respuesta.').catch(() => {});
        }

        if (output.length > 1990) {
            return loading.edit(output.slice(0, 1950) + '...').catch(() => {});
        }

        return loading.edit(output).catch(() => {});
    } catch (err) {
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
