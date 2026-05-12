const util = require("util");
const execFilePromise = util.promisify(require("child_process").execFile);

// Separador improbable de aparecer en títulos/URLs/canales
const SEP = "\x1F"; // ASCII Unit Separator
const FORMAT = [
  "%(title)s",
  "%(webpage_url)s",
  "%(duration_string)s",
  "%(channel)s",
].join(SEP);

function parseLines(stdout) {
  return stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [title, url, duration, channel] = line.split(SEP);
      return {
        title: title || "Sin titulo",
        url: url || "",
        durationRaw: duration || "?",
        duration: duration || "?",
        channel: { name: channel || "?" },
        author: { name: channel || "?" },
      };
    });
}

async function searchYt(query, limit = 5) {
  const { stdout } = await execFilePromise(
    "yt-dlp",
    ["--default-search", "ytsearch", "-O", FORMAT, `ytsearch${limit}:${query}`],
    { maxBuffer: 4 * 1024 * 1024 },
  );
  return parseLines(stdout);
}

async function getVideoInfo(url) {
  const { stdout } = await execFilePromise(
    "yt-dlp",
    ["--no-playlist", "-O", FORMAT, url],
    { maxBuffer: 4 * 1024 * 1024 },
  );
  const results = parseLines(stdout);
  if (results.length === 0)
    throw new Error("yt-dlp no devolvio info del video");
  return results[0];
}

async function getPlaylistInfo(url) {
  // --flat-playlist: rapido, no llama a cada video, solo lista entradas
  const { stdout } = await execFilePromise(
    "yt-dlp",
    ["--flat-playlist", "-O", FORMAT, url],
    { maxBuffer: 16 * 1024 * 1024 },
  );
  const videos = parseLines(stdout);
  if (videos.length === 0) throw new Error("Playlist vacia o no accesible");

  // Intentar sacar tambien el titulo de la playlist
  let title = "Playlist";
  try {
    const { stdout: titleOut } = await execFilePromise(
      "yt-dlp",
      [
        "--flat-playlist",
        "--playlist-items",
        "0",
        "--print",
        "playlist_title",
        url,
      ],
      { maxBuffer: 256 * 1024 },
    );
    const t = titleOut.trim().split("\n")[0];
    if (t) title = t;
  } catch (_) {
    /* ignorar, usar default */
  }

  return { title, videos };
}

async function resolveStreamUrl(url) {
  const { stdout } = await execFilePromise(
    "yt-dlp",
    ["-f", "bestaudio", "-g", "--no-playlist", url],
    { maxBuffer: 1 * 1024 * 1024 },
  );
  const direct = stdout.trim().split("\n").filter(Boolean)[0];
  if (!direct) throw new Error("yt-dlp no devolvio URL directa");
  return direct;
}

module.exports = { searchYt, getVideoInfo, getPlaylistInfo, resolveStreamUrl };
