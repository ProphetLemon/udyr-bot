const play = require("play-dl");
const { getQueue, handleSong } = require("../lib/queueManager");
const ytdlp = require("../lib/ytdlp");

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
    const info = await play.video_info(url);
    const vd = info.video_details;
    return {
      title: vd.title,
      url: vd.url || url,
      duration: vd.durationRaw || "Desconocida",
    };
  } catch (e) {
    console.log("[URL] play-dl video_info fallo, usando yt-dlp:", e.message);
    const v = await ytdlp.getVideoInfo(url);
    return {
      title: v.title,
      url: v.url || url,
      duration: v.durationRaw || "Desconocida",
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
        duration: v.durationRaw || v.durationInSec || "Desconocida",
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
        duration: v.durationRaw || "Desconocida",
      })),
    };
  }
}

function classifyMessage(content, maxChoice) {
  const trimmed = content.trim();
  if (!/^\d+$/.test(trimmed)) return { kind: "invalid" };
  const num = parseInt(trimmed, 10);
  if (num < 1 || num > maxChoice) return { kind: "out_of_range", num };
  return { kind: "valid", num };
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

      console.log("[URL] Obteniendo info del video...");
      const song = await getVideoInfo(query);
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
        const duration = v.durationRaw || v.duration || "?";
        const channelName = v.channel?.name || v.author?.name || "?";
        replyText += `\n**${i + 1}.** ${v.title} \`[${duration}]\` - ${channelName}`;
      });
      replyText += `\n\nEscribe el numero **(1-${results.length})** del video que quieres reproducir. Tienes 30 segundos. Escribe **cancelar** para cancelar.`;
      await message.reply(replyText);

      const filter = (m) => m.author.id === message.author.id;
      const collected = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
      });
      if (collected.size === 0) {
        return message.reply("Se acabo el tiempo. Vuelve a intentarlo.");
      }

      const content = collected.first().content.trim();
      if (content.toLowerCase() === "cancelar") {
        return message.reply("Busqueda cancelada.");
      }

      const parsed = classifyMessage(content, results.length);
      if (parsed.kind === "invalid") {
        return message.reply(
          "Eso no es un numero valido. Vuelve a intentarlo.",
        );
      }
      if (parsed.kind === "out_of_range") {
        return message.reply(
          `El numero debe estar entre 1 y ${results.length}. Vuelve a intentarlo.`,
        );
      }

      const selected = results[parsed.num - 1];
      console.log(
        `[SEARCH] Elegido ${parsed.num}: "${selected.title}" url:"${selected.url}"`,
      );

      if (!selected.url) {
        return message.reply(
          "El resultado seleccionado no tiene URL valida. Vuelve a intentarlo.",
        );
      }

      const song = {
        title: selected.title,
        url: selected.url,
        duration: selected.durationRaw || selected.duration || "Desconocida",
      };
      await handleSong(message, voiceChannel, song);
    }
  } catch (error) {
    console.error("[ERROR] handleYt:", error.stack || error.message);
    if (error.message === "time") {
      return message.reply("Se acabo el tiempo. Vuelve a intentarlo.");
    }
    return message.reply("Ocurrio un error al procesar tu solicitud.");
  }
};
