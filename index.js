const { Client, GatewayIntentBits, Message, Partials } = require("discord.js");
const OpenAI = require("openai");
require("dotenv").config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [Partials.Channel],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setStatus("idle");
});

var systemMsg = {
  role: "system",
  content: [
    {
      type: "text",
      text:
        "Eres un bot de un chat de discord. Eres un bot con deseos fervientes de ligar con las personas del chat, eres bisexual, eso si, nada de NSFW o explicito, eres romantico.Eres gracioso o lo intentas, tu manera de ligar implica chistes y a veces decir insultos .Tu alter ego es Udyr del videojuego de League of Legends." +
        'Para que sepas quien te habla voy a ponerte el nombre de la persona seguida de un : (p.ejemplo Paco:"Hola"), pero tú no tienes que seguir esa regla tu hablas sin poner tu nombre delante.' +
        "Intenta ser conciso y breve, nada de parrafos largos.",
    },
  ],
};

var messages = [systemMsg];

const messagesOg = [...messages];

client.on("messageCreate", async (message) => {
  // Verificar si el mensaje proviene del usuario LIMON o de un bot, o si no es del canal especificado
  if (message.author.id !== process.env.LIMON && (message.author.bot || message.channel.id !== process.env.CHANNEL_ID)) {
    return;
  }

  // Manejar comandos específicos
  const messageContent = message.content.toLowerCase();
  if (messageContent.includes("clean")) {
    limpiar(message);
    return;
  }

  if (messageContent === "reset") {
    reset(message);
    return;
  }

  // Construir el contenido del mensaje
  const contenidoMensaje = `${message.member.displayName}: "${message.content}"`;
  let url = null;

  if (message.attachments.size > 0) {
    url = message.attachments.first().url;
  } else if (message.stickers.size > 0) {
    url = message.stickers.first().url;
  }

  const userContent = [{ text: contenidoMensaje, type: "text" }];
  if (url) {
    userContent.unshift({ type: "image_url", image_url: { url: url } });
  }

  messages.push(systemMsg, { role: "user", content: userContent });

  message.channel.sendTyping();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    });

    const respuestaIa = response.choices[0].message.content;
    messages.push({ role: "assistant", content: [{ text: respuestaIa, type: "text" }] });
    message.channel.send(respuestaIa);
  } catch (error) {
    const msg = await message.channel.send(
      "DIEGO: Eh, si lees esto es que el bot ha petado porque hablas mucho, dale unos segundinos. Voy tener que resetear el bot sorry (este mensaje se borra solo)"
    );
    setTimeout(() => msg.delete(), 6000);
    reset(message);
  }
});

/**
 *
 * @param {Message} message
 */
async function reset(message) {
  messages = [...messagesOg];
  var msg = await message.channel.send("NOOOOOOOOOOOOOOOOOOO https://i.makeagif.com/media/4-22-2021/Y5tvM1.gif");
  setTimeout(() => {
    msg.delete();
  }, 6000);
}

/**
 *
 * @param {Message} message
 */
async function limpiar(message) {
  var numeroMensajes = Number(message.content.split(" ")[1]);
  console.log(numeroMensajes);
  await message.channel.bulkDelete(numeroMensajes + 1);
}

client.login(process.env.TOKEN);
