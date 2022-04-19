const { Message } = require("discord.js");
var historiales = new Map()
module.exports = {
    name: 'ia',
    aliases: ['ai'],
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
        var cosas = args.join(" ") + "\n"
        var messageUdyr
        var id = message.guild ? message.guild.id : message.author.id
        if (!historiales.get(id)) {
            historiales.set(id, "")
        }
        message.channel.send("Escribiendo...").then(msg => {
            messageUdyr = msg
        })
        const response = await openai.createCompletion("text-davinci-002", {
            prompt: historiales.get(id) + cosas,
            temperature: 0.8,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).catch(error => {
            console.log(error)
            message.channel.send("Me he liado")
        });
        messageUdyr.delete()
        if (!response || !response.data || !response.data.choices || !response.data.choices[0].text) {
            historiales.delete(id)
            return message.channel.send("Ha habido un problemilla, intentalo mas tarde")
        }
        historiales.set(id, historiales.get(id) + cosas + response.data.choices[0].text + "\n" + "\n")
        for (let i = 0; i < response.data.choices[0].text.length; i += 2000) {
            message.channel.send(response.data.choices[0].text.substring(i, i + 2000));
        }
        if (3000 - (historiales.get(id).length / 4) <= 200) {
            message.channel.send("Hay demasiado en memoria, voy borrar el historial").then(msg => {
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
            historiales.delete(id)
        }
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}