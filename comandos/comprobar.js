const { Message, Client } = require('discord.js');
const profileModel = require('../models/profileSchema');
const roboModel = require('../models/roboSchema');
const moment = require('moment');
global.listaRobos = new Map()
module.exports = {
    name: 'comprobar',
    aliases: [],
    description: 'Funcion para comprobar los contadores de los robos',
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
        if (message.channel.id != "809786674875334677") {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("Hazlo en udyr")
        }
        var robos = await roboModel.find()
        for (let i = 0; i < robos.length; i++) {
            var robo = robos[i]
            if (!listaRobos.get(robo.userIDLadron)) {
                var profile = await profileModel.findOne({
                    serverID: message.guild.id,
                    userID: robo.userIDLadron
                })
                var dateNow = getCETorCESTDate()
                var diff = moment(profile.robar).add(4, 'hours').toDate() - dateNow
                if (diff > 0) {
                    var timeout = setTimeout(async (mensaje, robo) => {
                        listaRobos.delete(robo.userIDLadron)
                        await profileModel.findOneAndUpdate({
                            userID: robo.userIDLadron,
                            serverID: mensaje.guild.id
                        }, {
                            $inc: {
                                udyrcoins: robo.dinero
                            }
                        })
                        await roboModel.findOneAndRemove({
                            userIDLadron: robo.userIDLadron
                        })
                        message.channel.send(`Han pasado 4 horas asi que <@!${robo.userIDLadron}> ha robado ${robo.dinero} <:udyrcoin:825031865395445760> a <@!${robo.userIDAfectado}>`)
                    }, diff, message, robo);
                    listaRobos.set(robo.userIDLadron, timeout)
                } else {
                    await profileModel.findOneAndUpdate({
                        userID: robo.userIDLadron,
                        serverID: message.guild.id
                    }, {
                        $inc: {
                            udyrcoins: robo.dinero
                        }
                    })
                    await roboModel.findOneAndRemove({
                        userIDLadron: robo.userIDLadron
                    })
                    message.channel.send(`Han pasado 4 horas asi que <@!${robo.userIDLadron}> ha robado ${robo.dinero} <:udyrcoin:825031865395445760> a <@!${robo.userIDAfectado}>`)
                }
            }
        }
        message.channel.send("Se han comprobado correctamente los robos!").then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 6000);
        })
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}