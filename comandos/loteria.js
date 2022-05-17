const { Message, Client } = require('discord.js');
const loteriaModel = require('../models/loteriaSchema')
const profileModel = require('../models/profileSchema');
const boletoModel = require('../models/boletoSchema');
const impuestoModel = require('../models/impuestoSchema')
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}
function leerDiscurso(array, textChannel) {
    if (array.length == 0) {
        return
    }
    setTimeout(() => {
        textChannel.send(array[0])
        array.splice(0, 1)
        leerDiscurso(array, textChannel)
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
        //AQUI TE ECHO SI NO ERES EL ADMIN
        if (message.author.id != "202065665597636609") {
            return message.reply("Si no y si quieres te la chupo maricón").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 7000);
            })
        }
        var guild = message.guild
        const textChannel = guild.channels.cache.find(channel => channel.id === "809786674875334677" && channel.isText())
        //AQUI PARSEO LA FECHA
        var fecha = args.join(" ") //udyr loteria (24/05/2022)
        var fechaLoteria = new Date()
        fechaLoteria.setDate(fecha.split("/")[0])
        fechaLoteria.setMonth(Number(fecha.split("/")[1]) - 1)
        fechaLoteria.setFullYear(fecha.split("/")[2])
        fechaLoteria.setHours(21)
        fechaLoteria.setMinutes(0)
        fechaLoteria.setSeconds(0)
        var startTime = moment(fechaLoteria).add(-15, "minutes").toDate()
        //AQUI BORRO LA LOTERIA SI YA HUBIERA UNA PROGRAMA PARA SOBRESCRIBIRLA
        if (loteria.get(guild.id)) {
            clearTimeout(loteria.get(guild.id))
            loteria.delete(guild.id)
        }
        await loteriaModel.remove({ serverID: guild.id })
        var evento = await guild.scheduledEvents.create({ name: "Loteria de Udyr", image: "./images/loteria_udyr.png", scheduledStartTime: startTime, scheduledEndTime: fechaLoteria, privacyLevel: 'GUILD_ONLY', entityType: 'EXTERNAL', entityMetadata: { location: "En el canal de udyr" }, description: "EMPIEZA LA LOTERIA DE UDYR\nUsa el comando 'udyr boleto' seguido de un numero de 5 cifras y participa en este evento en el que se reparte dinero de manera poco justa" })
        var dateNow = new Date()
        var diff = fechaLoteria - dateNow
        var timeout = setTimeout(async () => {
            loteria.delete(guild.id)
            var boletos = await boletoModel.find({})
            boletos = shuffleArray(boletos)
            var ganador = boletos[0]
            var segundo = boletos[1]
            var tercero = boletos[2]
            var serverDinero = await impuestoModel.findOne({
                serverID: guild.id
            })
            var discurso = []
            discurso.push("BIEVENIDOS A LA LOTERIA DE UDYR")
            discurso.push(`EN ESTE EVENTO HAN PARTICIPADO ${boletos.length} PERSONAS`)
            discurso.push(`Y 3 PERSONAS SE REPARTIRAN DE MANERA POCO JUSTA LOS ${serverDinero.udyrcoins} <:udyrcoin:961729720104419408>`)
            discurso.push(`EL PRIMER PREMIO ES PARA:`)
            discurso.push(`<@!${ganador.userID}>`)
            discurso.push(`EL SEGUNDO PREMIO ES PARA:`)
            discurso.push(`<@!${segundo.userID}>`)
            discurso.push(`EL TERCER Y ULTIMO PREMIO ES PARA:`)
            discurso.push(`<@!${tercero.userID}>`)
            textChannel.send(discurso[0])
            discurso.splice(0, 1)
            leerDiscurso(discurso, textChannel)
            var dineroPrimerPremio = Math.floor(Number(serverDinero.udyrcoins) * 60 / 100)
            var dineroSegundoPremio = Math.floor((Number(serverDinero.udyrcoins) - dineroPrimerPremio) * 60 / 100)
            var tercerPremio = Number(serverDinero.udyrcoins) - dineroPrimerPremio - dineroSegundoPremio
            console.log(dineroPrimerPremio + " " + dineroSegundoPremio + " " + tercerPremio)
            await profileModel.findOneAndUpdate({
                userID: ganador.userID,
                serverID: guild.id
            }, {
                $inc: {
                    udyrcoins: dineroPrimerPremio
                }
            })
            await profileModel.findOneAndUpdate({
                userID: segundo.userID,
                serverID: guild.id
            }, {
                $inc: {
                    udyrcoins: dineroSegundoPremio
                }
            })
            await profileModel.findOneAndUpdate({
                userID: tercero.userID,
                serverID: guild.id
            }, {
                $inc: {
                    udyrcoins: tercerPremio
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: guild.id
            }, {
                $set: {
                    udyrcoins: 0
                }
            })
            await boletoModel.remove({})
            await loteriaModel.remove({ serverID: guild.id })
        }, diff);
        loteria.set(guild.id, timeout)
        var loteriaBBDD = await loteriaModel.create({
            serverID: guild.id,
            dia: fechaLoteria
        })
        await loteriaBBDD.save()
        message.channel.send("Loteria configurada!")
    }

}
