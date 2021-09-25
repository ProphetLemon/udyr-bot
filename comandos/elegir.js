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
        if (opciones.length == 0) return message.channel.send("No has puesto ninguna opci\u00F3n")
        if (opciones.length == 1) return message.channel.send("Solo has puesto una opci\u00F3n")
        var mensaje = [];
        mensaje.push("Tras mucho pensar")
        mensaje.push("He llegado a una conclusi\u00F3n")
        mensaje.push("Mi decisi\u00F3n final es...")
        mensaje.push(`**${opciones[Math.floor(Math.random() * opciones.length)].toUpperCase()}**`)
        leerAburrimiento(mensaje, message)
    }
}
async function leerAburrimiento(mensaje, message) {
    if (mensaje.length == 0) return;
    setTimeout(function () {
        message.channel.send(mensaje[0])
        mensaje.splice(0, 1)
        leerAburrimiento(mensaje, message)
    }, 4000)
}
