const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
} = require('@discordjs/voice');
const { spawn } = require('child_process');
const util = require('util');

const execPromise = util.promisify(require('child_process').exec);

const queues = new Map();

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

module.exports = {
    queues,
    getQueue,
    destroyQueue,
    handleSong,
    playNext,
};
