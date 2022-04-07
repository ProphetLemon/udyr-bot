const { Message, Client, MessageEmbed } = require('discord.js');
const message = require('../eventos/guild/message');
const boletoModel = require('../models/boletoSchema');
const impuestoModel = require('../models/impuestoSchema')
var loteria = new Map()
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}
function leerDiscurso(array, message) {
    if (array.length == 2) {
        message.channel.send(array[0])
        message.channel.send(array[1])
        return
    }
    setTimeout(() => {
        message.channel.send(array[0])
        array.splice(0, 1)
        leerDiscurso(array, message)
    }, 10000);
}
module.exports = {
    name: 'loteria',
    aliases: [],
    description: 'Funcion que inicializa la loteria',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (message.author.id != "202065665597636609") {
            return message.channel.send("No eres el admin bro")
        }
        if (message.guild == null) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send("Esto se hace en el canal de udyr")
        }
        if (loteria.get(message.guild.id)) {
            return message.channel.send("La loteria ya estaba en marcha")
        }
        var diff = 0
        var timeout = setTimeout(async () => {
            loteria.delete(message.guild.id)
            var boletos = await boletoModel.find({})
            boletos = shuffleArray(boletos)
            var ganador = boletos[0]
            var serverDinero = await impuestoModel.findOne({
                serverID: message.guild.id
            })
            var discurso = []
            discurso.push("BIEVENIDOS A LA PRIMERA LOTERIA DE UDYR")
            discurso.push(`AHORA MISMO NOS ESTAN VIENDO POR EL CANAL DE VOZ ${message.guild.channels.cache.get("961580945587200030").members.array().length} PERSONAS`)
            discurso.push(`Y EN ESTE EVENTO HAN PARTICIPADO ${boletos.length} PERSONAS`)
            discurso.push(`PERO SOLO UNA SE LLEVARA LOS ${serverDinero.udyrcoins} <:udyrcoin:961729720104419408>`)
            discurso.push(`VOY DECIR LOS NUMEROS DEL BOLETO GANADOR UNO A UNO, SIENDO EL PRIMERO EL DE LA IZQUIERDA DEL TODO`)
            discurso.push(`EL PRIMER NUMERO ES EL ${ganador.numeroBoleto.charAt(0)}`)
            discurso.push(`EL SEGUNDO NUMERO ES EL ${ganador.numeroBoleto.charAt(1)}`)
            discurso.push(`EL TERCER NUMERO ES EL ${ganador.numeroBoleto.charAt(2)}`)
            discurso.push(`EL CUARTO NUMERO ES EL ${ganador.numeroBoleto.charAt(3)}`)
            discurso.push(`EL QUINTO Y ULTIMO NUMERO ES EL ${ganador.numeroBoleto.charAt(4)}`)
            const newEmbed = new MessageEmbed()
                .setColor("#B17428")
                .setTitle(`LOTERIA DE UDYR`)
                .addFields(
                    { name: "COMPRADOR", value: `<@!${ganador.userID}>`, inline: true },
                    { name: "NUMERO", value: ganador.numeroBoleto, inline: true })
                .setImage("https://tulotero.es/wp-content/uploads/2018/09/D%C3%A9cimo-Loter%C3%ADa-de-Navidad-2018.jpeg")
            discurso.push(newEmbed)
            message.channel.send(discurso[0])
            discurso.splice(0, 1)
            leerDiscurso(discurso, message)
        }, diff);
        loteria.set(message.guild.id, timeout)
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}
