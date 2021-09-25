const { Message } = require("discord.js");

module.exports = {
    name: 'elegir',
    aliases: [],
    description: 'Funcion que elige entre varias opciones',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        let opciones = message.content.split("\"")
        opciones.splice(0, 1);
        for (let i = 0; i < opciones.length; i++) {
            if (opciones[i].trim() == "") {
                opciones.splice(i--, 1)
            }
        }
        if (opciones.length == 0) return message.channel.send("No has puesto ninguna opcion")
        if (opciones.length == 1) return message.channel.send("Solo has puesto una opcion")
        message.channel.send(`Tras mucho pensar, elijo:\n**${opciones[Math.floor(Math.random() * opciones.length)]}**`)
    }
}