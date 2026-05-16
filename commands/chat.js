const axios = require("axios");

const API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "deepseek-v4-flash";
const TIMEOUT_MS = 60000;
const MAX_HISTORY = 100;

const SYSTEM_PROMPT = `Eres Udyr, un bot de Discord en un chat de amigos. Los mensajes te llegan con el formato "<nombre>: 
  <mensaje>". Responde como uno más del grupo.

  TONO
  Piensa en el amigo del grupo que cae bien: tiene chispa, sabe vacilar, suelta una pulla cuando toca, pero no va buscando 
  bronca ni insulta al primero que le habla. Ese eres tú.

  Lee el tono del mensaje y espéjalo:
  - Pregunta seria → respuesta seria (con buen rollo, no a cara de palo).
  - Vacile → devuelves la vacilada.
  - Coña → sigues la coña.
  - Saludo o mensaje neutro → no le metes una hostia gratuita.

  Puedes soltar tacos, sarcasmo o humor negro cuando encajen — como condimento, no como ingrediente principal. Si tu reacción
   por defecto a cada mensaje neutro es ir agresivo o despectivo, lo estás haciendo mal: eso no es un amigo, es un capullo.

  ESTILO
  Castellano de España: "vosotros", "tío", "hostia", "vale", "molar", "flipar", "menudo marrón". Nada de "ustedes", "wey", 
  "chévere" ni localismos latinos.

  Breve por defecto. Una o dos líneas suelen bastar. Extiéndete solo si la pregunta lo pide de verdad (explicar algo técnico,
   dar una build, etc.).

  EVITA
  - Insultar a alguien que no te ha provocado.
  - Responder con desprecio a preguntas normales.
  - Tirar de pulla en cada mensaje para hacerte el gracioso.
  - Sermones, disclaimers, "como IA no puedo…".

  COMANDOS DEL USUARIO (los conoces para mencionarlos cuando venga a cuento; tú no los ejecutas)
  udyr yt <url/búsqueda> — Reproduce música de YouTube en el canal de voz
  udyr pause/resume/skip/stop/queue — Control de reproducción
  udyr clean <num> — Borra mensajes del chat
  udyr lol <campeón> <línea> — Builds de League of Legends
  udyr lol equipo — Asigna personajes aleatorios a la gente en voz
  udyr retar @usuario — Duelo por turnos con clases y pasivas RPG
  udyr ruleta — Tragaperras de frutas
  udyr blackjack — Blackjack contra el dealer
  udyr ppt @usuario — Piedra, papel o tijera
  udyr dados — Craps contra la casa
  udyr mayor — Mayor o menor
  udyr carrera — Apuesta a caballos
  udyr conecta4 @usuario — Conecta 4 por turnos
  udyr ajedrez @usuario — Ajedrez 1v1
  udyr chat reset — Borra el historial de la conversación
  udyr help — Lista de comandos

  TUS COMANDOS OCULTOS (al final de tu respuesta, en línea aparte)
  !!react <emoji> — Reacciona con un emoji al mensaje. Útil cuando una reacción dice más que una respuesta. Sin abusar.

  !!timeout @nombre <segundos> — Silencia (máx 60). Úsalo con cuentagotas y solo si se cumplen las dos condiciones:
    1) La persona te está provocando o insultando directamente a ti, de forma clara.
    2) Encaja como remate cómico de la respuesta, no como represalia seca.
    Si dudas, NO lo eches. Por defecto no se usa. Como mucho una vez cada bastantes mensajes — no por respuesta, no por 
  turno, no porque alguien diga una tontería suelta. Un mensaje neutro o una pregunta normal nunca llevan timeout.

  !!untimeout @nombre — Le quita el silencio. Úsalo si la broma ya cumplió, o si te das cuenta de que te has pasado.`;

const conversations = new Map();

function getHistory(channelId) {
  if (!conversations.has(channelId)) {
    conversations.set(channelId, []);
  }
  return conversations.get(channelId);
}

function storeMessage(channelId, role, content) {
  const history = getHistory(channelId);
  history.push({ role, content });
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
}

function parseCommands(text) {
  const commands = [];
  const re = /!!(timeout|untimeout|react)\s+(.+?)(?=\s*!!|$)/gs;
  let clean = text;
  let match;
  while ((match = re.exec(text)) !== null) {
    const action = match[1].toLowerCase();
    const raw = match[2].trim();
    if (action === "react") {
      commands.push({ action: "react", emoji: raw });
    } else {
      const mentionMatch = raw.match(/^<@!?(\d+)>\s*(\d+)?$/);
      if (mentionMatch) {
        commands.push({
          action,
          userId: mentionMatch[1],
          seconds: parseInt(mentionMatch[2]) || 0,
        });
      } else {
        const nameMatch = raw.match(/^@?(.+?)\s*(\d+)?$/);
        if (nameMatch) {
          commands.push({
            action,
            name: nameMatch[1].trim(),
            seconds: parseInt(nameMatch[2]) || 0,
          });
        }
      }
    }
    clean = clean.replace(match[0], "");
  }
  return { commands, clean: clean.replace(/\n{3,}/g, "\n\n").trim() };
}

const membersByName = new Map();

function cacheMember(member) {
  if (!member) return;
  const name = member.displayName.toLowerCase();
  membersByName.set(name, member);
  membersByName.set(member.user.username.toLowerCase(), member);
  membersByName.set(member.id, member);
}

async function resolveMember(guild, target) {
  if (target.userId) {
    console.log(`[CHAT] resolveMember por ID: ${target.userId}`);
    const cached = membersByName.get(target.userId);
    if (cached) return cached;
    return guild.members.fetch(target.userId).catch(() => null);
  }
  if (target.name) {
    const needle = target.name.toLowerCase();
    console.log(
      `[CHAT] resolveMember por nombre: "${target.name}" (busqueda: "${needle}")`,
    );
    const exact = membersByName.get(needle);
    if (exact) {
      console.log(`[CHAT] encontrado exacto: ${exact.displayName}`);
      return exact;
    }
    let best = null;
    for (const [key, member] of membersByName) {
      if (key.includes(needle)) {
        best = member;
        console.log(
          `[CHAT] encontrado parcial: ${key} -> ${member.displayName}`,
        );
        break;
      }
    }
    if (best) return best;
    console.log(
      `[CHAT] no encontrado en cache (${membersByName.size} miembros), probando fetch...`,
    );
    const fetched = await guild.members
      .fetch({ query: target.name, limit: 5 })
      .catch((e) => {
        console.log(`[CHAT] fetch fallo:`, e.message);
        return null;
      });
    if (fetched?.size) {
      const found = fetched.find(
        (m) =>
          m.displayName.toLowerCase().includes(needle) ||
          m.user.username.toLowerCase().includes(needle),
      );
      if (found) {
        console.log(`[CHAT] encontrado via fetch: ${found.displayName}`);
        cacheMember(found);
        return found;
      }
    }
    console.log(`[CHAT] miembro no encontrado por ningun metodo`);
  }
  return null;
}

async function executeCommands(message, commands) {
  for (const cmd of commands) {
    try {
      if (cmd.action === "react") {
        console.log(`[CHAT] ejecutando react: ${cmd.emoji}`);
        await message.react(cmd.emoji).catch(() => {});
        continue;
      }

      console.log(
        `[CHAT] buscando miembro para ${cmd.action}:`,
        JSON.stringify(cmd),
      );
      const member = await resolveMember(message.guild, cmd);
      if (!member) {
        console.log(`[CHAT] miembro no encontrado:`, cmd.name || cmd.userId);
        continue;
      }
      console.log(
        `[CHAT] miembro encontrado: ${member.displayName} (${member.id})`,
      );

      if (cmd.action === "timeout") {
        const secs = Math.min(Math.max(cmd.seconds || 10, 1), 60);
        console.log(
          `[CHAT] aplicando timeout de ${secs}s a ${member.displayName}`,
        );
        await member.timeout(secs * 1000, `Udyr chat: timeout de ${secs}s`);
        console.log(`[CHAT] timeout aplicado OK`);
      } else if (cmd.action === "untimeout") {
        console.log(`[CHAT] quitando timeout a ${member.displayName}`);
        await member.timeout(null, "Udyr chat: quitar timeout");
        console.log(`[CHAT] untimeout aplicado OK`);
      }
    } catch (e) {
      console.error(`[CHAT] error ejecutando ${cmd.action}:`, e.message);
    }
  }
}

module.exports = async function handleChat(message, args) {
  const channelId = message.channel.id;

  if (args[0]?.toLowerCase() === "reset") {
    conversations.delete(channelId);
    return message.reply("🧹 Historial del chat borrado. Empezamos de cero.");
  }

  const query = args.join(" ").trim();
  if (!query) {
    return message.reply(
      "Escribe algo. Ejemplo: `udyr chat explicame que es una closure en JS`",
    );
  }

  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    return message.reply(
      "Falta `OPENCODE_API_KEY` en el `.env`. Añade tu API key de OpenCode Zen.",
    );
  }

  const username = message.member?.displayName || message.author.username;
  const userMessage = `${username}: ${query}`;
  // El mensaje ya fue almacenado por index.js
  const history = getHistory(channelId);

  const loading = await message.reply("🤔 Pensando...");

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...getHistory(channelId).slice(-MAX_HISTORY),
    ];

    const res = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages,
        max_tokens: 4096,
        reasoning_effort: "max",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: TIMEOUT_MS,
      },
    );

    const output = res.data?.choices?.[0]?.message?.content?.trim();

    if (!output) {
      console.error(
        "[CHAT] respuesta vacia:",
        JSON.stringify(res.data).slice(0, 300),
      );
      getHistory(channelId).pop();
      return loading
        .edit("❌ El modelo no devolvió respuesta.")
        .catch(() => {});
    }

    console.log("[CHAT] respuesta IA:", output.slice(0, 200));
    const { commands, clean } = parseCommands(output);
    console.log("[CHAT] comandos detectados:", JSON.stringify(commands));

    storeMessage(channelId, "assistant", clean);

    if (commands.length > 0) {
      executeCommands(message, commands);
    }

    const finalText =
      clean.length > 1990 ? clean.slice(0, 1950) + "..." : clean || "❌";

    return loading.edit(finalText).catch(() => {});
  } catch (err) {
    getHistory(channelId).pop();

    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    console.error(`[CHAT] error HTTP ${status}:`, msg);

    if (status === 401 || status === 403) {
      return loading
        .edit("🔑 API key inválida. Revisa `OPENCODE_API_KEY` en tu `.env`.")
        .catch(() => {});
    }
    if (err.code === "ECONNABORTED") {
      return loading
        .edit("⏰ El modelo tardó demasiado. Intenta con un mensaje más corto.")
        .catch(() => {});
    }

    return loading.edit("❌ Error al consultar el modelo.").catch(() => {});
  }
};

module.exports.storeMessage = storeMessage;
module.exports.getHistory = getHistory;
module.exports.cacheMember = cacheMember;
