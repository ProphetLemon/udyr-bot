const play = require("play-dl");
const { getQueue, handleSong } = require("../lib/queueManager");
const ytdlp = require("../lib/ytdlp");

const NUMBER_EMOJIS = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];
const CANCEL_EMOJI = '❌';

function formatDuration(value) {
  if (value == null || value === "") return "Desconocida";
  if (typeof value === "string") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return "Desconocida";
  const totalSec = Math.floor(value);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function searchYt(query, limit = 5) {
  try {
    const results = await play.search(query, { limit });
    if (results && results.length > 0) return results;
    console.log("[SEARCH] play-dl devolvio 0 resultados, probando yt-dlp");
  } catch (e) {
    console.log("[SEARCH] play-dl fallo, usando yt-dlp fallback:", e.message);
  }
  return ytdlp.searchYt(query, limit);
}

async function getVideoInfo(url) {
  try {
    const info = await Promise.race([
      play.video_info(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
    ]);
    const vd = info.video_details;
    return {
      title: vd.title,
      url: vd.url || url,
      duration: formatDuration(vd.durationRaw || vd.durationInSec),
    };
  } catch (e) {
    console.log("[URL] play-dl video_info fallo, usando yt-dlp:", e.message);
    const v = await ytdlp.getVideoInfo(url);
    return {
      title: v.title,
      url: v.url || url,
      duration: formatDuration(v.durationRaw),
    };
  }
}

async function getPlaylistInfo(url) {
  try {
    const playlist = await play.playlist_info(url);
    const videos = await playlist.all_videos();
    if (!videos || videos.length === 0) throw new Error("Playlist vacia");
    return {
      title: playlist.title || "Playlist",
      songs: videos.map((v) => ({
        title: v.title,
        url: v.url,
        duration: formatDuration(v.durationRaw || v.durationInSec),
      })),
    };
  } catch (e) {
    console.log("[URL] play-dl playlist_info fallo, usando yt-dlp:", e.message);
    const { title, videos } = await ytdlp.getPlaylistInfo(url);
    return {
      title,
      songs: videos.map((v) => ({
        title: v.title,
        url: v.url,
        duration: formatDuration(v.durationRaw),
      })),
    };
  }
}

module.exports = async function handleYt(message, args) {
  const query = args.join(" ");
  console.log(`[CMD] udyr yt "${query}"`);
  if (!query) {
    return message.reply(
      "Debes escribir algo despues de `udyr yt`. Ejemplo: `udyr yt loba shakira` o `udyr yt <url>`",
    );
  }

  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    return message.reply(
      "Tienes que estar en un canal de voz para usar este comando.",
    );
  }

  const isUrl = query.startsWith("http://") || query.startsWith("https://");

  try {
    if (isUrl) {
      console.log("[URL] Validando...");
      const validation = play.yt_validate(query);
      if (!validation || validation === "search") {
        return message.reply("La URL no es valida de YouTube.");
      }

      if (validation === "playlist") {
        console.log("[URL] Es playlist. Obteniendo info...");
        const { title, songs } = await getPlaylistInfo(query);
        console.log(`[URL] Playlist: "${title}" con ${songs.length} videos`);

        songs[0].directUrlPromise = ytdlp.resolveStreamUrl(songs[0].url).catch((e) => {
          console.log("[URL] prefetch playlist[0] fallo:", e.message?.split("\n")[0]);
          return null;
        });
        await handleSong(message, voiceChannel, songs[0]);
        const queue = getQueue(message.guild.id);
        if (!queue) {
          console.warn(
            "[URL] No se creo queue tras handleSong; resto de la playlist se descarta",
          );
        } else if (songs.length > 1) {
          for (let i = 1; i < songs.length; i++) {
            queue.songs.push(songs[i]);
          }
        }
        return message.channel.send(
          `Playlist **${title}** anadida. **${songs.length}** canciones en cola.`,
        );
      }

      if (validation !== "video") {
        return message.reply("La URL no es un video ni una playlist valida de YouTube.");
      }

      console.log("[URL] Obteniendo info del video y pre-resolviendo stream...");
      const directUrlPromise = ytdlp.resolveStreamUrl(query).catch((e) => {
        console.log("[URL] prefetch resolveStreamUrl fallo:", e.message?.split("\n")[0]);
        return null;
      });
      const song = await getVideoInfo(query);
      song.directUrlPromise = directUrlPromise;
      console.log(`[URL] song -> title:"${song.title}" url:"${song.url}"`);
      await handleSong(message, voiceChannel, song);
    } else {
      console.log("[SEARCH] Buscando...");
      const results = await searchYt(query, 5);
      console.log(`[SEARCH] ${results?.length || 0} resultados`);
      if (!results || results.length === 0) {
        return message.reply("No encontre resultados para tu busqueda.");
      }
      console.log(
        `[SEARCH] 1er resultado -> title:"${results[0].title}" url:"${results[0].url}"`,
      );

      let replyText = "**Resultados de busqueda:**\n";
      results.forEach((v, i) => {
        const duration = formatDuration(v.durationRaw || v.duration);
        const channelName = v.channel?.name || v.author?.name || "?";
        replyText += `\n**${i + 1}.** ${v.title} \`[${duration}]\` - ${channelName}`;
      });
      replyText += `\n\nReacciona con el numero del video que quieres reproducir, o ${CANCEL_EMOJI} para cancelar. Tienes 30 segundos.`;
      const menuMessage = await message.reply(replyText);

      const validEmojis = NUMBER_EMOJIS.slice(0, results.length).concat(CANCEL_EMOJI);
      const filter = (reaction, user) =>
        user.id === message.author.id && validEmojis.includes(reaction.emoji.name);
      const collectorPromise = menuMessage.awaitReactions({ filter, max: 1, time: 30000 });

      // Prefetch del candidato mas probable (resultado 1) en paralelo con el menu.
      // Si el usuario elige otro, esta resolucion se descarta y se hace una nueva en playNext.
      const prefetchTopUrl = results[0]?.url
        ? ytdlp.resolveStreamUrl(results[0].url).catch((e) => {
            console.log('[SEARCH] prefetch top fallo:', e.message?.split('\n')[0]);
            return null;
          })
        : null;

      try {
        const reactPromises = NUMBER_EMOJIS
          .slice(0, results.length)
          .concat(CANCEL_EMOJI)
          .map((emoji) => menuMessage.react(emoji));
        // Esperamos a que la primera tenga exito para detectar falta de permisos rapido,
        // y dejamos el resto en background sin bloquear el collector.
        await reactPromises[0];
        Promise.all(reactPromises.slice(1)).catch((e) =>
          console.error('[SEARCH] anadiendo reacciones (background):', e.message),
        );
      } catch (e) {
        console.error('[SEARCH] No se pudieron anadir reacciones:', e.message);
        return message.reply('No puedo anadir reacciones en este canal. Revisa que tenga permiso `Add Reactions`.');
      }

      const collected = await collectorPromise;
      menuMessage.reactions.removeAll().catch(() => {});

      if (collected.size === 0) {
        return message.reply('Se acabo el tiempo. Vuelve a intentarlo.');
      }
      const chosen = collected.first().emoji.name;
      if (chosen === CANCEL_EMOJI) {
        return message.reply('Busqueda cancelada.');
      }
      const index = NUMBER_EMOJIS.indexOf(chosen);
      const selected = results[index];
      console.log(
        `[SEARCH] Elegido ${index + 1}: "${selected.title}" url:"${selected.url}"`,
      );

      if (!selected.url) {
        return message.reply(
          "El resultado seleccionado no tiene URL valida. Vuelve a intentarlo.",
        );
      }

      const song = {
        title: selected.title,
        url: selected.url,
        duration: formatDuration(selected.durationRaw || selected.duration),
      };
      if (index === 0 && prefetchTopUrl) {
        song.directUrlPromise = prefetchTopUrl;
      } else {
        song.directUrlPromise = ytdlp.resolveStreamUrl(selected.url).catch((e) => {
          console.log('[SEARCH] prefetch elegido fallo:', e.message?.split('\n')[0]);
          return null;
        });
      }
      await handleSong(message, voiceChannel, song);
    }
  } catch (error) {
    console.error("[ERROR] handleYt:", error.stack || error.message);
    return message.reply("Ocurrio un error al procesar tu solicitud.");
  }
};
