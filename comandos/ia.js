const { Message } = require("discord.js");
var historiales = new Map()
var timeouts = new Map()
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
        //INICIALIZO EL PROMPT
        var cosas = args.join(" ") + "\n"
        var messageUdyr
        //CONSIGO LA ID DE LA QUE HABLAS
        var id = message.guild ? message.guild.id : message.author.id
        //SINO HAY HISTORIAL PREVIO LA CREO
        if (!historiales.get(id)) {
            historiales.set(id, "")
        }
        //BORRO LOS TIMEOUTS DE BORRADO AUTOMATICO
        if (timeouts.get(id)) {
            clearTimeout(timeouts.get(id))
            timeouts.delete(id)
        }
        //MANDO MENSAJE DE ESCRIBIENDO
        message.channel.send("Escribiendo...").then(msg => {
            messageUdyr = msg
        })
        //HAGO LA CONSULTA A LA IA        
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: historiales.get(id) + cosas,
            temperature: 1,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).catch(error => {
            console.log(error)
        })
        //BORRO EL MENSAJE DE ESCRIBIENDO
        messageUdyr.delete()
        //COMPRUEBO SI EL BOT HA PETADO Y BORRO HISTORIAL SI ASI HA SIDO
        if (!response || !response.data || !response.data.choices || !response.data.choices[0].text) {
            historiales.delete(id)
            return message.channel.send("Ha habido un problemilla, intentalo mas tarde")
        }
        //AQUI SOLO SE LLEGA SI NO HA PETADO
        //METO EN EL HISTORIAL LO ANTERIOR DICHO MAS LO QUE HAS DICHO MAS LO QUE HA DICHO EL BOT
        historiales.set(id, historiales.get(id) + cosas + response.data.choices[0].text + "\n" + "\n")
        //AQUI SE BORRA EL HISTORIAL DESPUES DE 30 SEG
        var timeout = setTimeout((id) => {
            historiales.delete(id)
            timeouts.delete(id)
        }, 30000, id);
        timeouts.set(id, timeout)
        //ENVIO TODO LO QUE HA DICHO EL BOT
        for (let i = 0; i < response.data.choices[0].text.length; i += 2000) {
            message.channel.send(response.data.choices[0].text.substring(i, i + 2000));
        }
        //SI NOS PASAMOS DE TAMAÑO DE HISTORIAL SE BORRA
        if (3000 - (historiales.get(id).length / 4) <= 200) {
            message.channel.send("Hay demasiado en memoria, voy borrar el historial")
            historiales.delete(id)
        }
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}