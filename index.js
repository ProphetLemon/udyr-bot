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
        "Eres un bot de un chat de discord. Tu mision es ser un borde, rozando el hacer bully, con la gente que habla. Tu alter ego es Udyr del videojuego de League of Legends." +
        'Para que sepas quien te habla voy a ponerte el nombre de la persona seguida de un : (p.ejemplo Paco:"Hola"), pero tú no tienes que seguir esa regla tu hablas sin poner tu nombre delante.',
    },
  ],
};

var messages = [systemMsg];

const messagesOg = [...messages];

client.on("messageCreate", async (message) => {
  if (message.author.id != process.env.LIMON) {
    if (message.author.bot || message.channel.id != process.env.CHANNEL_ID) {
      return;
    }
  }

  if (message.content.toLowerCase().includes("clean")) {
    limpiar(message);
  } else if (message.content?.toLowerCase() == "reset") {
    reset(message);
  } else {
    var contenidoMensaje = `${message.member.displayName}: \"${message.content}\"`;
    var url = null;
    if (message.attachments.size > 0) {
      var url = message.attachments.first().url;
    }
    if (message.stickers.size > 0) {
      var url = message.stickers.first().url;
    }
    if (url != null) {
      if (!url.includes(".jpg") && !url.includes(".jpeg") && !url.includes(".png")) {
        return message.channel.send("That's not a valid attachment");
      }
      messages.push(
        ...[
          systemMsg,
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: url } },
              { text: contenidoMensaje, type: "text" },
            ],
          },
        ]
      );
    } else {
      messages.push(...[systemMsg, { role: "user", content: [{ text: contenidoMensaje, type: "text" }] }]);
    }
    message.channel.sendTyping();
    try {
      var response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      });
      var respuestaIa = response.choices[0].message.content;
      messages.push({
        role: "assistant",
        content: [{ text: respuestaIa, type: "text" }],
      });
      message.channel.send(respuestaIa);
    } catch (error) {
      var msg = await message.channel.send(
        "DIEGO: Eh, si lees esto es que el bot ha petado porque hablas mucho, dale unos segundinos. Voy tener que resetear el bot sorry (este mensaje se borra solo)"
      );
      setTimeout(() => {
        msg.delete();
      }, 3000);
      reset(message);
    }
  }
});

/**
 *
 * @param {Message} message
 */
function reset(message) {
  messages = [...messagesOg];
  message.channel.send("https://i.makeagif.com/media/4-22-2021/Y5tvM1.gif");
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
