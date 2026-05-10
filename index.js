require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
} = require('@discordjs/voice');
const play = require('play-dl');
const { spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const { chromium } = require('playwright');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const prefix = 'udyr';
const queues = new Map();
let lolChampions = new Map(); // nombre ES normalizado -> ID EN

async function loadLolChampions() {
    try {
        const versionRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const version = versionRes.data[0];
        const res = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/es_ES/champion.json`);
        const champs = res.data.data;
        for (const key in champs) {
            const champ = champs[key];
            const nameNorm = normalizeChampName(champ.name);
            lolChampions.set(nameNorm, champ.id);
            // tambien con el key (nombre en ingles sin espacios)
            lolChampions.set(key.toLowerCase(), champ.id);
        }
        console.log(`[LOL] ${lolChampions.size} nombres de campeones cargados.`);
    } catch (e) {
        console.error('[LOL] Error cargando campeones:', e.message);
    }
}

function normalizeChampName(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

client.once('clientReady', () => {
    console.log(`[READY] Bot conectado como ${client.user.tag}`);
    loadLolChampions();
});

function getQueue(guildId) {
    return queues.get(guildId);
}

function destroyQueue(guildId) {
    const queue = queues.get(guildId);
    if (queue) {
        queue.connection?.destroy();
        queues.delete(guildId);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
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
});

// ---------- COMANDOS DE CONTROL ----------

function handlePause(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    if (queue.player.state.status === AudioPlayerStatus.Playing) {
        queue.player.pause();
        message.reply('Pausado.');
    } else {
        message.reply('Ya esta pausado o no esta sonando.');
    }
}

function handleResume(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    if (queue.player.state.status === AudioPlayerStatus.Paused) {
        queue.player.unpause();
        message.reply('Reanudado.');
    } else {
        message.reply('No esta pausado.');
    }
}

function handleSkip(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    if (!queue.current && queue.songs.length === 0) {
        return message.reply('No hay nada en la cola.');
    }
    message.reply(`Saltando: **${queue.current?.title || 'desconocido'}**`);
    queue.player.stop();
}

function handleStop(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    queue.songs = [];
    queue.current = null;
    queue.player.stop();
    destroyQueue(message.guild.id);
    message.reply('Cola vaciada y desconectado.');
}

function handleQueue(message) {
    const queue = getQueue(message.guild.id);
    if (!queue || (!queue.current && queue.songs.length === 0)) {
        return message.reply('La cola esta vacia.');
    }
    let text = '';
    if (queue.current) {
        text += `**Sonando ahora:** ${queue.current.title} \`[${queue.current.duration}]\`\n\n`;
    }
    if (queue.songs.length > 0) {
        text += '**En cola:**\n';
        queue.songs.forEach((s, i) => {
            text += `\n**${i + 1}.** ${s.title} \`[${s.duration}]\``;
        });
    } else {
        text += '**En cola:** (vacia)';
    }
    message.reply(text);
}

function handleHelp(message) {
    message.reply(
        '**Comandos disponibles:**\n' +
        '\n`udyr yt <url>` - Reproduce una URL de YouTube o playlist' +
        '\n`udyr yt <busqueda>` - Busca en YouTube y te deja elegir' +
        '\n`udyr pause` - Pausa la reproduccion' +
        '\n`udyr resume` - Reanuda la reproduccion' +
        '\n`udyr skip` - Salta la cancion actual' +
        '\n`udyr stop` - Detiene todo y desconecta' +
        '\n`udyr queue` - Muestra la cola' +
        '\n`udyr clean <num>` - Borra los ultimos <num> mensajes' +
        '\n`udyr lol <campeon> <linea>` - Screenshot de build de u.gg' +
        '\n`udyr help` - Muestra esta ayuda'
    );
}

async function handleClean(message, args) {
    if (!message.member.permissions.has('ManageMessages')) {
        return message.reply('Necesitas permiso de **Gestionar mensajes** para usar este comando.');
    }
    if (!message.guild.members.me.permissions.has('ManageMessages')) {
        return message.reply('Necesito permiso de **Gestionar mensajes** para borrar mensajes.');
    }

    let amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1) {
        return message.reply('Debes escribir un numero valido mayor que 0. Ejemplo: `udyr clean 5`');
    }
    if (amount > 100) {
        return message.reply('No puedo borrar mas de 100 mensajes a la vez.');
    }

    // +1 para incluir el propio mensaje del comando
    amount = amount + 1;

    try {
        const deleted = await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`Borrados **${deleted.size - 1}** mensajes.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    } catch (err) {
        console.error('[CLEAN] Error:', err.message);
        message.reply('No pude borrar los mensajes. Asegurate de que no tengan mas de 14 dias de antiguedad.');
    }
}

// ---------- COMANDO LOL ----------

async function handleLol(message, args) {
    if (args.length < 1) {
        return message.reply('Debes escribir un campeon. Ejemplo: `udyr lol akali mid` o `udyr lol yasuo top`');
    }

    // Mapeo de lineas
    const laneMap = {
        mid: 'mid', medio: 'mid', m: 'mid',
        top: 'top', superior: 'top', sup: 'top',
        jungle: 'jungle', jg: 'jungle', jungla: 'jungle',
        adc: 'adc', bot: 'adc', tirador: 'adc',
        support: 'support', supp: 'support', soporte: 'support',
    };

    const lane = laneMap[args[args.length - 1]?.toLowerCase()] || 'mid';
    // Si el ultimo arg es una linea valida, lo quitamos del nombre del campeon
    const champArgs = laneMap[args[args.length - 1]?.toLowerCase()] ? args.slice(0, -1) : args;
    const champInput = champArgs.join(' ');
    const champNorm = normalizeChampName(champInput);

    let champId = lolChampions.get(champNorm);
    if (!champId) {
        // intentar coincidencia parcial
        for (const [key, val] of lolChampions) {
            if (key.includes(champNorm) || champNorm.includes(key)) {
                champId = val;
                break;
            }
        }
    }
    if (!champId) {
        return message.reply(`No encontre el campeon **${champInput}**. Asegurate de escribirlo bien.`);
    }

    const url = `https://u.gg/lol/champions/${champId}/build?role=${lane}`;
    console.log(`[LOL] Screenshot de ${url}`);
    const loadingMsg = await message.reply(`Buscando build de **${champId}** ${lane}...`);

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        await page.goto(url, { waitUntil: 'networkidle' });
        // Cerrar modal de cookies si existe
        try {
            // Intentar clicar botones comunes de aceptar cookies
            const cookieButtons = [
                'button:has-text("Accept")',
                'button:has-text("Accept All")',
                'button:has-text("I Accept")',
                'button:has-text("Aceptar")',
                'button:has-text("Accept Cookies")',
                '[data-testid="uc-accept-all-button"]',
                '.qc-cmp2-summary-buttons button:first-child',
            ];
            for (const sel of cookieButtons) {
                const btn = await page.locator(sel).first();
                if (await btn.isVisible().catch(() => false)) {
                    await btn.click();
                    console.log('[LOL] Modal de cookies cerrada');
                    break;
                }
            }
        } catch (e) {
            // ignorar si no hay modal
        }
        // Fallback: eliminar overlays de cookies directamente del DOM
        try {
            await page.evaluate(() => {
                const selectors = [
                    '#cookie-banner', '.cookie-banner', '.cookie-consent', '.cookie-modal',
                    '#cookieConsent', '.qc-cmp2-container', '.onetrust-pc-dark-filter',
                    '#onetrust-consent-sdk', '.cc-banner', '.gdpr-consent',
                    '[class*="cookie"]', '[id*="cookie"]', '[class*="consent"]', '[id*="consent"]',
                ];
                selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => {
                        if (el && el.parentNode) el.parentNode.removeChild(el);
                    });
                });
            });
        } catch (e) {
            // ignorar
        }
        // Esperar un poco mas por si hay animaciones
        await page.waitForTimeout(2000);

        const runePath = `/tmp/udyr-lol-${champId}-${lane}-runas.png`;
        const skillsPath = `/tmp/udyr-lol-${champId}-${lane}-skills.png`;
        const buildPath = `/tmp/udyr-lol-${champId}-${lane}-build.png`;

        // Screenshot 1: Runas + Summoner Spells (contenedor .rune-spell)
        try {
            const runeContainer = await page.locator('.rune-spell').first();
            if (await runeContainer.isVisible().catch(() => false)) {
                await runeContainer.screenshot({ path: runePath });
                console.log('[LOL] Captura de runas completada');
            } else {
                await page.screenshot({ path: runePath, fullPage: false });
            }
        } catch (e) {
            console.log('[LOL] Error capturando runas:', e.message);
            await page.screenshot({ path: runePath, fullPage: false });
        }

        // Screenshot 2: Skill Priority + Skill Path (contenedor .recommended-build_skills)
        try {
            const skillsContainer = await page.locator('.recommended-build_skills').first();
            if (await skillsContainer.isVisible().catch(() => false)) {
                await skillsContainer.screenshot({ path: skillsPath });
                console.log('[LOL] Captura de skills completada');
            } else {
                await page.screenshot({ path: skillsPath, fullPage: false });
            }
        } catch (e) {
            console.log('[LOL] Error capturando skills:', e.message);
            await page.screenshot({ path: skillsPath, fullPage: false });
        }

        // Screenshot 3: Items (contenedor .recommended-build_items)
        try {
            const buildContainer = await page.locator('.recommended-build_items').first();
            if (await buildContainer.isVisible().catch(() => false)) {
                await buildContainer.screenshot({ path: buildPath });
                console.log('[LOL] Captura de build completada');
            } else {
                await page.screenshot({ path: buildPath, fullPage: false });
            }
        } catch (e) {
            console.log('[LOL] Error capturando build:', e.message);
            await page.screenshot({ path: buildPath, fullPage: false });
        }

        await browser.close();
        browser = null;

        await loadingMsg.delete().catch(() => {});
        await message.channel.send({
            content: `Build de **${champId}** en **${lane.toUpperCase()}**\n${url}`,
            files: [runePath, skillsPath, buildPath],
        });
    } catch (err) {
        console.error('[LOL] Error:', err.message);
        if (browser) await browser.close().catch(() => {});
        await loadingMsg.edit(`No pude obtener la build. Puedes verla aqui: ${url}`);
    }
}

// ---------- COMANDO YT ----------

async function handleYt(message, args) {
    const query = args.join(' ');
    console.log(`[CMD] udyr yt "${query}"`);
    if (!query) {
        return message.reply('Debes escribir algo despues de `udyr yt`. Ejemplo: `udyr yt loba shakira` o `udyr yt <url>`');
    }

    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
        return message.reply('Tienes que estar en un canal de voz para usar este comando.');
    }

    const isUrl = query.startsWith('http://') || query.startsWith('https://');

    try {
        if (isUrl) {
            console.log('[URL] Validando...');
            const validation = play.yt_validate(query);
            if (!validation) {
                return message.reply('La URL no es valida de YouTube.');
            }

            if (validation === 'playlist') {
                console.log('[URL] Es playlist. Obteniendo info...');
                const playlist = await play.playlist_info(query);
                const videos = await playlist.all_videos();
                console.log(`[URL] Playlist: "${playlist.title}" con ${videos.length} videos`);
                if (!videos || videos.length === 0) {
                    return message.reply('La playlist esta vacia.');
                }

                const songs = videos.map(v => ({
                    title: v.title,
                    url: v.url,
                    duration: v.durationRaw || v.durationInSec || 'Desconocida',
                }));

                await handleSong(message, voiceChannel, songs[0]);
                const queue = queues.get(message.guild.id);
                if (queue && songs.length > 1) {
                    for (let i = 1; i < songs.length; i++) {
                        queue.songs.push(songs[i]);
                    }
                }
                return message.channel.send(
                    `Playlist **${playlist.title}** anadida. **${songs.length}** canciones en cola.`
                );
            }

            console.log('[URL] Obteniendo info del video...');
            const videoInfo = await play.video_info(query);
            const vd = videoInfo.video_details;
            console.log(`[URL] video_details -> title:"${vd.title}" url:"${vd.url}" durationRaw:"${vd.durationRaw}"`);

            const song = {
                title: vd.title,
                url: vd.url || query,
                duration: vd.durationRaw || 'Desconocida',
            };
            console.log(`[URL] song -> title:"${song.title}" url:"${song.url}"`);
            await handleSong(message, voiceChannel, song);
        } else {
            console.log('[SEARCH] Buscando...');
            const results = await play.search(query, { limit: 5 });
            console.log(`[SEARCH] ${results?.length || 0} resultados`);
            if (!results || results.length === 0) {
                return message.reply('No encontre resultados para tu busqueda.');
            }
            console.log(`[SEARCH] 1er resultado -> title:"${results[0].title}" url:"${results[0].url}"`);

            let replyText = '**Resultados de busqueda:**\n';
            results.forEach((v, i) => {
                const duration = v.durationRaw || v.duration || '?';
                const channelName = v.channel?.name || v.author?.name || '?';
                replyText += `\n**${i + 1}.** ${v.title} \`[${duration}]\` - ${channelName}`;
            });
            replyText += '\n\nEscribe el numero **(1-5)** del video que quieres reproducir. Tienes 30 segundos.';
            await message.reply(replyText);

            const filter = (m) => {
                const num = parseInt(m.content, 10);
                return m.author.id === message.author.id && !isNaN(num) && num >= 1 && num <= results.length;
            };
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            if (collected.size === 0) {
                return message.reply('Se acabo el tiempo. Vuelve a intentarlo.');
            }

            const choice = parseInt(collected.first().content, 10);
            const selected = results[choice - 1];
            console.log(`[SEARCH] Elegido ${choice}: "${selected.title}" url:"${selected.url}"`);

            const song = {
                title: selected.title,
                url: selected.url,
                duration: selected.durationRaw || selected.duration || 'Desconocida',
            };
            await handleSong(message, voiceChannel, song);
        }
    } catch (error) {
        console.error('[ERROR] messageCreate:', error.stack || error.message);
        if (error.message === 'time') {
            return message.reply('Se acabo el tiempo. Vuelve a intentarlo.');
        }
        return message.reply('Ocurrio un error al procesar tu solicitud.');
    }
}

// ---------- GESTION DE COLA ----------

async function handleSong(message, voiceChannel, song) {
    const guildId = message.guild.id;
    let queue = queues.get(guildId);
    console.log(`[QUEUE] handleSong guild=${guildId} colaExistente=${!!queue}`);

    if (!queue) {
        console.log('[QUEUE] Creando player y conexion...');
        const player = createAudioPlayer();
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });
        connection.subscribe(player);

        queue = { connection, player, songs: [], current: null, textChannel: message.channel };
        queues.set(guildId, queue);

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('[PLAYER] Estado: Idle -> siguiente');
            queue.current = null;
            playNext(guildId, message);
        });
        player.on(AudioPlayerStatus.Playing, () => {
            console.log('[PLAYER] Estado: Playing');
        });
        player.on(AudioPlayerStatus.Buffering, () => {
            console.log('[PLAYER] Estado: Buffering');
        });
        player.on(AudioPlayerStatus.Paused, () => {
            console.log('[PLAYER] Estado: Paused');
        });
        player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log('[PLAYER] Estado: AutoPaused');
        });

        player.on('error', (error) => {
            console.error('[PLAYER] error:', error.message);
            queue.current = null;
            playNext(guildId, message);
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('[VOICE] Conexion lista (Ready)');
        });
        connection.on(VoiceConnectionStatus.Connecting, () => {
            console.log('[VOICE] Estado: Connecting');
        });
        connection.on(VoiceConnectionStatus.Signalling, () => {
            console.log('[VOICE] Estado: Signalling');
        });
        connection.on(VoiceConnectionStatus.Destroyed, () => {
            console.log('[VOICE] Estado: Destroyed');
        });
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            console.log('[VOICE] Estado: Disconnected');
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (e) {
                connection.destroy();
                queues.delete(guildId);
            }
        });
    }

    queue.songs.push(song);
    console.log(`[QUEUE] anadida. cola=${queue.songs.length} current=${queue.current ? 'si' : 'no'}`);

    if (!queue.current) {
        console.log('[QUEUE] iniciando playNext');
        playNext(guildId, message);
    } else {
        await message.channel.send(`Anadido a la cola: **${song.title}**`);
    }
}

async function playNext(guildId, message) {
    const queue = queues.get(guildId);
    console.log(`[PLAYNEXT] guild=${guildId} cola=${queue ? queue.songs.length : 'null'}`);
    if (!queue || queue.songs.length === 0) {
        console.log('[PLAYNEXT] vacia -> disconnect');
        queue?.textChannel?.send('Cola terminada. Desconectando...');
        if (queue?.connection) queue.connection.destroy();
        queues.delete(guildId);
        return;
    }

    const song = queue.songs.shift();
    queue.current = song;
    queue.textChannel?.send(`Reproduciendo ahora: **${song.title}**`);
    console.log(`[PLAYNEXT] cancion="${song.title}" url="${song.url}"`);

    try {
        if (queue.connection.state.status !== VoiceConnectionStatus.Ready) {
            console.log(`[PLAYNEXT] Esperando conexion lista (estado=${queue.connection.state.status})...`);
            await entersState(queue.connection, VoiceConnectionStatus.Ready, 15_000);
            console.log('[PLAYNEXT] Conexion lista');
        }

        console.log(`[PLAYNEXT] Obteniendo URL directa de yt-dlp...`);
        const { stdout } = await execPromise(`yt-dlp --get-url -f bestaudio "${song.url}"`, { maxBuffer: 1024 * 1024 });
        const directUrl = stdout.trim();
        console.log(`[PLAYNEXT] URL directa obtenida: ${directUrl.substring(0, 80)}...`);

        const ffmpeg = spawn('ffmpeg', [
            '-reconnect', '1',
            '-reconnect_streamed', '1',
            '-reconnect_delay_max', '5',
            '-i', directUrl,
            '-f', 'opus',
            '-acodec', 'libopus',
            '-ar', '48000',
            '-ac', '2',
            '-b:a', '96k',
            '-loglevel', 'error',
            'pipe:1'
        ]);

        ffmpeg.on('error', (err) => console.error('[PLAYNEXT] ffmpeg error:', err.message));
        ffmpeg.stderr.on('data', (d) => console.error('[PLAYNEXT] ffmpeg stderr:', d.toString()));
        let bytes = 0;
        ffmpeg.stdout.on('data', (d) => {
            bytes += d.length;
            if (bytes <= 2000) {
                console.log(`[PLAYNEXT] ffmpeg stdout recibio ${d.length} bytes (total: ${bytes})`);
            } else if (bytes - d.length <= 2000) {
                console.log(`[PLAYNEXT] ffmpeg stdout ya envio >2000 bytes, dejando de loggear...`);
            }
        });
        ffmpeg.stdout.on('end', () => console.log('[PLAYNEXT] ffmpeg stdout end'));
        ffmpeg.stdout.on('close', () => console.log('[PLAYNEXT] ffmpeg stdout close'));

        const resource = createAudioResource(ffmpeg.stdout, { inputType: StreamType.OggOpus });
        console.log('[PLAYNEXT] resource creado (oggopus)');
        console.log(`[PLAYNEXT] conexion.estado=${queue.connection.state.status}`);
        queue.player.play(resource);
        console.log('[PLAYNEXT] play() ejecutado');
        console.log('[PLAYNEXT] player.estado=' + queue.player.state.status);
        console.log('[PLAYNEXT] conexion.estado despues de play=' + queue.connection.state.status);

        setTimeout(() => {
            console.log(`[PLAYNEXT] 2s despues: player.estado=${queue?.player?.state?.status}, conexion.estado=${queue?.connection?.state?.status}`);
        }, 2000);
    } catch (error) {
        console.error('[PLAYNEXT] ERROR:', error.stack || error.message);
        if (message?.channel) {
            message.channel.send(`No pude reproducir **${song.title}**. Pasando a la siguiente.`);
        }
        queue.current = null;
        playNext(guildId, message);
    }
}

client.login(process.env.DISCORD_TOKEN);
