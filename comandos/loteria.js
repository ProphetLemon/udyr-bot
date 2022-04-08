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
        if (message.guild == null || message.channel.id != "809786674875334677") {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send("Esto se hace en el canal de udyr")
        }
        if (loteria.get(message.guild.id)) {
            return message.channel.send("La loteria ya estaba en marcha")
        }
        var dateNow = new Date()
        var dateLoteria = new Date()
        dateLoteria.setDate(10)
        dateLoteria.setHours(21)
        dateLoteria.setMinutes(0)
        dateLoteria.setSeconds(0)
        var diff = dateLoteria - dateNow
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
            discurso.push(`EN ESTE EVENTO HAN PARTICIPADO ${boletos.length} PERSONAS`)
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
                .setImage("https://cdn.discordapp.com/attachments/953974289919520778/961736600537161728/loteria_udyr.png")
            discurso.push(newEmbed)
            message.channel.send(discurso[0])
            discurso.splice(0, 1)
            leerDiscurso(discurso, message)
        }, diff);
        loteria.set(message.guild.id, timeout)
        message.channel.send(`La loteria se ha programado correctamente!`)
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}
