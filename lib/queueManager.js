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
const ytdlpLib = require('./ytdlp');

const queues = new Map();

function getQueue(guildId) {
    return queues.get(guildId);
}

function destroyQueue(guildId) {
    const queue = queues.get(guildId);
    if (!queue) return;
    queue.destroying = true;
    queue.ytdlp?.kill('SIGKILL');
    queue.ffmpeg?.kill('SIGKILL');
    queue.connection?.destroy();
    queues.delete(guildId);
}

function destroyAllQueues() {
    for (const guildId of queues.keys()) {
        destroyQueue(guildId);
    }
}

async function handleSong(message, voiceChannel, song) {
    const guildId = message.guild.id;
    let queue = queues.get(guildId);

    if (!queue) {
        const player = createAudioPlayer();
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });
        connection.subscribe(player);

        queue = {
            connection,
            player,
            songs: [],
            current: null,
            textChannel: message.channel,
            ytdlp: null,
            ffmpeg: null,
            destroying: false,
        };
        queues.set(guildId, queue);

        player.on(AudioPlayerStatus.Idle, () => {
            queue.current = null;
            killChildren(queue);
            playNext(guildId);
        });

        player.on('error', (error) => {
            console.error('[PLAYER] error:', error.message);
            queue.current = null;
            killChildren(queue);
            playNext(guildId);
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            if (queue.destroying) return;
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                destroyQueue(guildId);
            }
        });
    }

    queue.songs.push(song);

    if (!queue.current) {
        playNext(guildId);
    } else {
        await message.channel.send(`Anadido a la cola: **${song.title}**`);
    }
}

function killChildren(queue) {
    queue.ytdlp?.kill('SIGKILL');
    queue.ffmpeg?.kill('SIGKILL');
    queue.ytdlp = null;
    queue.ffmpeg = null;
}

async function resolveDirectUrl(song) {
    if (song.directUrl) return song.directUrl;
    if (song.directUrlPromise) {
        const prefetched = await song.directUrlPromise;
        if (prefetched) {
            song.directUrl = prefetched;
            return prefetched;
        }
    }
    const url = await ytdlpLib.resolveStreamUrl(song.url);
    song.directUrl = url;
    return url;
}

function prefetchNext(queue) {
    const next = queue.songs[0];
    if (!next || next.directUrl || next.directUrlPromise) return;
    next.directUrlPromise = ytdlpLib.resolveStreamUrl(next.url).catch((e) => {
        console.log(`[YT-DLP] prefetch look-ahead "${next.title}":`, e.message?.split('\n')[0]);
        return null;
    });
}

async function playNext(guildId) {
    const queue = queues.get(guildId);
    if (!queue || queue.songs.length === 0) {
        await queue?.textChannel?.send('Cola terminada. Desconectando...');
        if (queue) destroyQueue(guildId);
        return;
    }

    const song = queue.songs.shift();
    queue.current = song;

    try {
        let directUrl;
        try {
            directUrl = await resolveDirectUrl(song);
        } catch (e) {
            console.error(`[YT-DLP] no se pudo resolver "${song.title}": ${e.message?.split('\n')[0]}`);
            queue.textChannel?.send(`No pude reproducir **${song.title}** (video no disponible). Pasando a la siguiente.`).catch(() => {});
            queue.current = null;
            return playNext(guildId);
        }

        queue.textChannel?.send(`Reproduciendo ahora: **${song.title}**`).catch(() => {});

        if (queue.connection.state.status !== VoiceConnectionStatus.Ready) {
            await entersState(queue.connection, VoiceConnectionStatus.Ready, 15_000);
        }

        // ffmpeg consume la URL firmada directamente y transcodifica a opus.
        // No hay shell: argv-style spawn → sin inyeccion posible.
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
            'pipe:1',
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        ffmpeg.stderr.on('data', (d) => console.error('[FFMPEG]', d.toString().trim()));
        ffmpeg.on('error', (err) => console.error('[FFMPEG] error:', err.message));

        queue.ytdlp = null;
        queue.ffmpeg = ffmpeg;

        const resource = createAudioResource(ffmpeg.stdout, { inputType: StreamType.OggOpus });
        queue.player.play(resource);

        // Look-ahead: prefetch del directUrl de la siguiente cancion en background.
        // Elimina el gap entre canciones (sobre todo en playlists) sin saturar la Pi:
        // sólo 1 yt-dlp simultaneo extra, y no compite con ffmpeg (red vs CPU).
        prefetchNext(queue);
    } catch (error) {
        console.error('[PLAYNEXT] error:', error.message);
        queue.textChannel?.send(`No pude reproducir **${song.title}**. Pasando a la siguiente.`).catch(() => {});
        queue.current = null;
        killChildren(queue);
        playNext(guildId);
    }
}

module.exports = {
    queues,
    getQueue,
    destroyQueue,
    destroyAllQueues,
    handleSong,
    playNext,
};
