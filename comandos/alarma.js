const { Message, Client } = require("discord.js")
module.exports = {
    name: 'alarma',
    aliases: [],
    description: 'Funcion para crear apuestas o apostar en ellas',
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
        return;
        console.log("INICIO ALARMA")
        if (message.guild) {
            return message.channel.send("Esto se hace por privado").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
        }
        var horaDia = args[0]
        var dateLater = new Date()
        if (horaDia.includes(":")) {
            var hora = horaDia.split(":")[0]
            var minutos = horaDia.split(":")[1]
            dateLater.setHours(hora)
            dateLater.setMinutes(minutos)
            args.splice(0, 1)
        } else if (horaDia.includes("/")) {
            var dia = horaDia.split("/")[0]
            var mes = horaDia.split("/")[1]
            dateLater.setDate(dia)
            dateLater.setMonth(mes)
            if (dateLater.getMonth() != mes || dateLater.getDate() != dia) {
                return message.channel.send("Fecha invalida, tienes que poner una de dos opciones:\nudyr alarma 13:40 _mensaje de la alarma_\nudyr alarma 12/03 13:40 _mensaje de la alarma_")
            }
            horaDia = args[1]
            if (horaDia.includes(":")) {
                var hora = horaDia.split(":")[0]
                var minutos = horaDia.split(":")[1]
                dateLater.setHours(hora)
                dateLater.setMinutes(minutos)
            } else {
                return message.channel.send("Fecha invalida, tienes que poner una de dos opciones:\nudyr alarma 13:40 _mensaje de la alarma_\nudyr alarma 12/03 13:40 _mensaje de la alarma_")
            }
            args.splice(0, 2)
        } else {
            return message.channel.send("Fecha invalida, tienes que poner una de dos opciones:\nudyr alarma 13:40 _mensaje de la alarma_\nudyr alarma 12/03 13:40 _mensaje de la alarma_")
        }
        dateLater.setSeconds(0)
        var mensaje = ""
        if (args.length > 0) {
            mensaje = args.join(" ")
        } else {
            mensaje = "Querias que te avisase a esta hora"
        }
        var dateNow = new Date()
        var diff = dateLater - dateNow
        if (diff < 0) {
            return message.channel.send("Has puesto una fecha anterior a la de hoy")
        }
        setTimeout((message, mensaje) => {
            message.channel.send(mensaje)
        }, diff, message, mensaje);
        message.channel.send("Se ha creado la alarma correctamente!")
        console.log("FIN ALARMA")
    }
}