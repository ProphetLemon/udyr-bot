const { spawn } = require('child_process');
const TIMEOUT_MS = 60000;

module.exports = async function handleChat(message, args) {
    const query = args.join(' ').trim();
    if (!query) {
        return message.reply('Escribe algo. Ejemplo: `udyr chat explicame que es una closure en JS`');
    }

    const loading = await message.reply('🤔 Pensando...');

    const child = spawn('opencode', [
        'run', query,
        '-m', 'opencode-go/deepseek-v4-pro',
        '--variant', 'minimal',
    ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });

    const timer = setTimeout(() => {
        child.kill();
    }, TIMEOUT_MS);

    child.on('close', async (code) => {
        clearTimeout(timer);

        if (code !== 0 && code !== null) {
            console.error('[CHAT] opencode exit:', code, stderr.slice(0, 200));
            return loading.edit('❌ Error al consultar el modelo.').catch(() => {});
        }

        const output = stdout
            .replace(/\x1b\[[0-9;]*m/g, '')
            .replace(/^>?\s*build\s*[·•]\s*deepseek-v4-pro\s*/gm, '')
            .trim();

        if (!output) {
            return loading.edit('❌ El modelo no devolvió respuesta.').catch(() => {});
        }

        if (output.length > 1990) {
            return loading.edit('📤 Muy largo, inicio:\n\n' + output.slice(0, 1950) + '...').catch(() => {});
        }

        return loading.edit(output).catch(() => {});
    });
};
