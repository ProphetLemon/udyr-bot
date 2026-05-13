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
            directUrl = await ytdlpLib.resolveStreamUrl(song.url);
        } catch (e) {
            console.error(`[YT-DLP] no se pudo resolver "${song.title}": ${e.message?.split('\n')[0]}`);
            queue.textChannel?.send(`No pude reproducir **${song.title}** (video no disponible). Pasando a la siguiente.`).catch(() => {});
            queue.current = null;
            return playNext(guildId);
        }

        await queue.textChannel?.send(`Reproduciendo ahora: **${song.title}**`).catch(() => {});

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
