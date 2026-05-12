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
    queue.ytdlp?.kill('SIGKILL');
    queue.ffmpeg?.kill('SIGKILL');
    queue.connection?.destroy();
    queues.delete(guildId);
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
        queue?.textChannel?.send('Cola terminada. Desconectando...');
        if (queue) destroyQueue(guildId);
        return;
    }

    const song = queue.songs.shift();
    queue.current = song;

    try {
        try {
            await ytdlpLib.resolveStreamUrl(song.url);
        } catch (e) {
            console.error(`[YT-DLP] no se pudo resolver "${song.title}": ${e.message?.split('\n')[0]}`);
            queue.textChannel?.send(`No pude reproducir **${song.title}** (video no disponible). Pasando a la siguiente.`);
            queue.current = null;
            return playNext(guildId);
        }

        queue.textChannel?.send(`Reproduciendo ahora: **${song.title}**`);

        if (queue.connection.state.status !== VoiceConnectionStatus.Ready) {
            await entersState(queue.connection, VoiceConnectionStatus.Ready, 15_000);
        }

        // yt-dlp escribe el audio crudo a stdout; ffmpeg lo transcodifica a opus.
        // Usamos execFile-style argv (sin shell) → sin inyeccion posible.
        const ytdlp = spawn('yt-dlp', [
            ...ytdlpLib.YT_JS_ARGS,
            '-f', 'bestaudio',
            '-o', '-',
            '--quiet',
            '--no-warnings',
            song.url,
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        const ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-f', 'opus',
            '-acodec', 'libopus',
            '-ar', '48000',
            '-ac', '2',
            '-b:a', '96k',
            '-loglevel', 'error',
            'pipe:1',
        ], { stdio: ['pipe', 'pipe', 'pipe'] });

        ytdlp.stdout.pipe(ffmpeg.stdin);
        ytdlp.stdout.on('error', (err) => {
            if (err.code !== 'EPIPE') console.error('[YT-DLP STDOUT]', err.message);
        });
        ffmpeg.stdin.on('error', (err) => {
            if (err.code !== 'EPIPE') console.error('[FFMPEG STDIN]', err.message);
        });
        ytdlp.stderr.on('data', (d) => console.error('[YT-DLP]', d.toString().trim()));
        ffmpeg.stderr.on('data', (d) => console.error('[FFMPEG]', d.toString().trim()));

        ytdlp.on('error', (err) => console.error('[YT-DLP] error:', err.message));
        ffmpeg.on('error', (err) => console.error('[FFMPEG] error:', err.message));

        // Si yt-dlp muere antes de tiempo, cerramos stdin de ffmpeg
        ytdlp.on('close', (code) => {
            if (code !== 0 && code !== null) {
                console.error(`[YT-DLP] exit code=${code} para "${song.title}"`);
            }
            try { ffmpeg.stdin.end(); } catch {}
        });

        queue.ytdlp = ytdlp;
        queue.ffmpeg = ffmpeg;

        const resource = createAudioResource(ffmpeg.stdout, { inputType: StreamType.OggOpus });
        queue.player.play(resource);
    } catch (error) {
        console.error('[PLAYNEXT] error:', error.message);
        queue.textChannel?.send(`No pude reproducir **${song.title}**. Pasando a la siguiente.`);
        queue.current = null;
        killChildren(queue);
        playNext(guildId);
    }
}

module.exports = {
    queues,
    getQueue,
    destroyQueue,
    handleSong,
    playNext,
};
