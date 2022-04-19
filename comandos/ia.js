const { Message } = require("discord.js");
var peticiones = new Map()
/**
 * 
 * @param {Message} message 
 */
function editarMensaje(message) {
    if (message.content == "Escribiendo.") {
        var timeout = setTimeout(() => {
            message.edit("Escribiendo..")
            return editarMensaje(message)
        }, 1000);

    }
    if (message.content == "Escribiendo..") {
        var timeout = setTimeout(() => {
            message.edit("Escribiendo...")
            return editarMensaje(message)
        }, 1000);
    }
    if (message.content == "Escribiendo...") {
        var timeout = setTimeout(() => {
            message.edit("Escribiendo.")
            return editarMensaje(message)
        }, 1000);
    }
    peticiones.set(message.author.id, timeout)
}
module.exports = {
    name: 'ia',
    aliases: [],
    description: 'Funcion para calcular lo que te roba hacienda',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`);
        var cosas = args.join(" ") + "."
        var messageUdyr
        message.channel.send("Escribiendo.").then(msg => {
            messageUdyr = msg
            editarMensaje(msg)
        })
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: cosas,
            temperature: 0.7,
            max_tokens: 3900,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        clearTimeout(peticiones.get("849997112930074654"))
        peticiones.delete(message.author.id)
        messageUdyr.delete()
        if (!response.data || !response.data.choices || !response.data.choices[0].text) {
            return message.channel.send("Ha habido un problemilla, intentalo mas tarde")
        }
        for (let i = 0; i < response.data.choices[0].text.length; i += 2000) {
            message.channel.send(response.data.choices[0].text.substring(i, i + 2000));
        }
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}