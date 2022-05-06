const { Message, Client, MessageEmbed } = require('discord.js');
const boletoModel = require('../models/boletoSchema');
const impuestoModel = require('../models/impuestoSchema')
const profileModel = require('../models/profileSchema');
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
    if (array.length == 0) {
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
            return message.channel.send("La loteria ya estaba en marcha").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 7000);
            })
        }
        var dateNow = new Date()
        var dateLoteria = new Date()
        dateLoteria.setDate(8)
        dateLoteria.setHours(21)
        dateLoteria.setMinutes(0)
        dateLoteria.setSeconds(0)
        var diff = dateLoteria - dateNow
        var timeout = setTimeout(async () => {
            loteria.delete(message.guild.id)
            var boletos = await boletoModel.find({})
            boletos = shuffleArray(boletos)
            var ganador = boletos[0]
            var segundo = boletos[1]
            var tercero = boletos[2]
            var serverDinero = await impuestoModel.findOne({
                serverID: message.guild.id
            })
            var discurso = []
            discurso.push("BIEVENIDOS A LA PRIMERA LOTERIA DE UDYR")
            discurso.push(`EN ESTE EVENTO HAN PARTICIPADO ${boletos.length} PERSONAS`)
            discurso.push(`Y 3 PERSONAS SE REPARTIRAN DE MANERA POCO JUSTA LOS ${serverDinero.udyrcoins} <:udyrcoin:961729720104419408>`)
            discurso.push(`EL PRIMER PREMIO ES PARA:`)
            discurso.push(`<@!${ganador.userID}>`)
            discurso.push(`EL SEGUNDO PREMIO ES PARA:`)
            discurso.push(`<@!${segundo.userID}>`)
            discurso.push(`EL TERCER Y ULTIMO PREMIO ES PARA:`)
            discurso.push(`<@!${tercero.userID}>`)
            message.channel.send(discurso[0])
            discurso.splice(0, 1)
            leerDiscurso(discurso, message)
            var dineroPrimerPremio = Math.floor(Number(serverDinero.udyrcoins) * 60 / 100)
            var dineroSegundoPremio = Math.floor((Number(serverDinero.udyrcoins) - dineroPrimerPremio) * 60 / 100)
            var tercerPremio = Math.floor((Number(serverDinero.udyrcoins) - dineroPrimerPremio - dineroSegundoPremio) * 60 / 100)
            console.log(dineroPrimerPremio + " " + dineroSegundoPremio + " " + tercerPremio)
            await profileModel.findOneAndUpdate({
                userID: ganador.userID,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: dineroPrimerPremio
                }
            })
            await profileModel.findOneAndUpdate({
                userID: segundo.userID,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: dineroSegundoPremio
                }
            })
            await profileModel.findOneAndUpdate({
                userID: tercero.userID,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: tercerPremio
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: message.guild.id
            }, {
                $set: {
                    udyrcoins: 0
                }
            })
        }, diff);
        loteria.set(message.guild.id, timeout)
        message.channel.send(`La loteria se ha programado correctamente!`).then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 7000);
        })
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}
