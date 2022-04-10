const { Message, Client, MessageEmbed } = require('discord.js');
const boletoModel = require('../models/boletoSchema');
const profileModel = require('../models/profileSchema');
const impuestoModel = require('../models/impuestoSchema')
module.exports = {
    name: 'boleto',
    aliases: ['boletos'],
    description: 'Funcion que te compra un boleto',
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
        //SI USAS EL COMANDO 'BOLETOS'
        if (cmd.toLocaleLowerCase() == 'boletos') {
            var boletos = await boletoModel.find({})
            var log = []
            var memberManager = await message.guild.members.fetch()
            for (let i = 0; i < boletos.length; i++) {
                var memberI = memberManager.find(member => member.id == boletos[i].userID)
                log.push(`${memberI.displayName}: ${boletos[i].numeroBoleto}\n`)
            }
            log.sort(function (a, b) {
                if (a < b) { return -1; }
                if (a > b) { return 1; }
                return 0;
            })
            log.splice(0, 0, `Por ahora han participado ${boletos.length} personas!`)
            message.channel.send(log.join("\n")).then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 7000);
            })
            console.log(`FIN ${cmd.toUpperCase()}`)
            return
        }
        //COMPROBAR QUE ESTAS EN LA BBDD
        if (!profileData) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("No tas inscrito en la Liga Udyr, maric\u00F3n. Haz un 'udyr puntos' antes")
        }
        //QUE NO LO HAS POR PRIVADO
        if (message.guild == null) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send("Esto se hace en el canal de udyr")
        }
        //TE MUESTRA EL BOLETO SI COMPRASTE YA UNO Y YA
        var user = await boletoModel.findOne({
            userID: message.author.id
        })
        if (user) {
            const newEmbed = new MessageEmbed()
                .setColor("#B17428")
                .setTitle(`LOTERIA DE UDYR`)
                .addFields(
                    { name: "COMPRADOR", value: message.member.displayName, inline: true },
                    { name: "NUMERO", value: user.numeroBoleto, inline: true })
                .setImage("https://cdn.discordapp.com/attachments/953974289919520778/961736600537161728/loteria_udyr.png")
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send(newEmbed)
        }
        //QUE EL NUMERO SEA VALIDO
        var numeroBoletoUser = args[0]
        if (metodosUtiles.isValidNumber(numeroBoletoUser) == false) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send("Pon un n\u00FAmero de boleto v\u00E1lido anda").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
        }
        numeroBoletoUser = numeroBoletoUser.padStart(5, "0")
        if (numeroBoletoUser.length > 5) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send("El n\u00FAmero no debede superar los 5 digitos").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
        }
        //QUE EL NUMERO DE TU BOLETO NO ESTE PILLADO YA
        var boleto = await boletoModel.findOne({ numeroBoleto: numeroBoletoUser })
        if (boleto) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send("Ese n\u00FAmero ya est\u00E1 pillado").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
        }
        //AQUI COMPROBAMOS SI TIENES EL DINERO
        if (profileData.udyrcoins < 50) {
            return message.channel.send("No tienes dinero para comprar un boleto, vale 50 <:udyrcoin:961729720104419408>").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
        } else {
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: -50
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: 50
                }
            })
        }
        //AQUI SE COMPRA EL BOLETO SI TODO SALE GUCCI
        var boletoFinal = await boletoModel.create({
            userID: message.author.id,
            numeroBoleto: numeroBoletoUser
        })
        await boletoFinal.save()
        //AQUI MUESTRO EL BOLETO DESPUES DE COMPRARLO
        const newEmbed = new MessageEmbed()
            .setColor("#B17428")
            .setTitle(`LOTERIA DE UDYR`)
            .addFields(
                { name: "COMPRADOR", value: message.member.displayName, inline: true },
                { name: "N\u00DAMERO", value: numeroBoletoUser, inline: true })
            .setImage("https://cdn.discordapp.com/attachments/953974289919520778/961736600537161728/loteria_udyr.png")
        message.channel.send(`Has comprado el boleto con n\u00FAmero ${numeroBoletoUser}!`)
        message.channel.send(newEmbed)
        message.delete()
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}
