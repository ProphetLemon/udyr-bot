const play = require('play-dl');
const { getQueue, handleSong } = require('../lib/queueManager');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

async function searchYt(query, limit = 5) {
    try {
        const results = await play.search(query, { limit });
        if (results && results.length > 0) return results;
    } catch (e) {
        console.log('[SEARCH] play-dl fallo, usando yt-dlp fallback:', e.message);
    }

    // Fallback con yt-dlp
    const { stdout } = await execPromise(
        `yt-dlp --default-search "ytsearch" -O "%(title)s|%(webpage_url)s|%(duration_string)s|%(channel)s" "ytsearch${limit}:${query}"`,
        { maxBuffer: 1024 * 1024 }
    );

    return stdout.trim().split('\n').filter(Boolean).map(line => {
        const parts = line.split('|');
        return {
            title: parts[0] || 'Sin titulo',
            url: parts[1] || '',
            durationRaw: parts[2] || '?',
            duration: parts[2] || '?',
            channel: { name: parts[3] || '?' },
            author: { name: parts[3] || '?' },
        };
    });
}

module.exports = async function handleYt(message, args) {
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
                const queue = getQueue(message.guild.id);
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
            const results = await searchYt(query, 5);
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
};
