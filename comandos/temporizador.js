const { Message, Client } = require("discord.js")
module.exports = {
    name: 'temporizador',
    aliases: ['temp'],
    description: 'Funcion para crear temporizadores',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (isNaN(args[0])) {
            return message.channel.send("Maric\u00F3n, se esperaba un numero, el comando se usa asi:\nudyr temp 5 _mensaje opcional_\nsiendo 5 los minutos de espera")
        }
        var minutos = Math.floor(Number(args[0]))
        if (minutos == 0) {
            return message.channel.send("Maric\u00F3n, ese numero no es valido, el comando se usa asi:\nudyr temp 5 _mensaje opcional_\nsiendo 5 los minutos de espera")
        }
        args.splice(0, 1)
        var mensaje = ""
        if (args.length > 0) {
            mensaje = args.join(" ")
        } else {
            mensaje = `Han pasado ya los ${minutos} minutos`
        }
        setTimeout((message, mensaje) => {
            message.channel.send(mensaje)
        }, minutos * 60 * 1000, message, mensaje);
        if (message.guild) {
            message.delete()
        }
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}