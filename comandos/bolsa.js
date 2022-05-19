const { Message, Client, MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const bolsaModel = require('../models/bolsaSchema')
const profileModel = require('../models/profileSchema')
const superfalo = "Has considerado que en vez de malgastar el dinero en bolsa debas meter 10 € en https://www.paypal.me/Superfalo ?"
const QuickChart = require('quickchart-js');
module.exports = {
    name: 'bolsa',
    aliases: ['comprar', 'acciones', 'vender'],
    description: 'Funcion para ver los valores en bolsa ahora mismo',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {Discord} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (message.channel.id != "976611174915375174") {
            return message.reply("Esto mejor en el canal de 'bolsa'").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
        }
        if (cmd == "vender") {
            if (!profileData.wallet) {
                return message.reply("No tienes nada comprado")
            }
            var wallet = profileData.wallet
            if (args.length == 0) {
                return message.reply("No has escrito nada. " + superfalo)
            }
            var nombre = args[0]
            var stock = await bolsaModel.findOne({ nombre: nombre })
            if (!stock) {
                return message.reply("No existe esa compañia. " + superfalo)
            }
            var cantidad = args[1]
            if (isNaN(cantidad)) {
                return message.reply("No has aprobado matemáticas ni en primaria. " + superfalo)
            }
            if (cantidad <= 0) {
                return message.reply(`Has escrito una cantida invalida de acciones. ${superfalo}`)
            }
            cantidad = Number(cantidad)
            if (!wallet.get(nombre)) {
                return message.reply(`No tienes nada comprado a esa ${nombre}. ${superfalo}`)
            } else if (wallet.get(nombre) < cantidad) {
                return message.reply(`No tienes tantas acciones de ${nombre}. ${superfalo}`)
            }
            var valorEmpresa = getValorEmpresa(stock)
            var dineroAGanar = valorEmpresa * cantidad
            wallet.set(nombre, wallet.get(nombre) - cantidad)
            if (wallet.get(nombre) == 0) {
                wallet.delete(nombre)
            }
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: {
                    wallet: wallet
                },
                $inc: {
                    udyrcoins: dineroAGanar
                }
            })
            message.channel.send(`Has vendido ${cantidad} ${nombre}${cantidad > 1 ? "s" : ""}!`)
        }
        if (cmd == "acciones") {
            var acciones = profileData.wallet
            if (acciones) {
                var newEmbed = new MessageEmbed()
                newEmbed.setTitle(`Acciones de ${message.member ? message.member.displayName : message.author.username}`)
                newEmbed.setThumbnail(message.author.displayAvatarURL({ format: "png" }))
                for (var [key, value] of acciones) {
                    newEmbed.addField(key, String(value), true)
                }
                message.channel.send({ embeds: [newEmbed] })
            } else {
                message.reply("No tienes nada comprado")
            }
        }
        /**
        * PRECIO FINAL CADA HORA
        * SE ACTUALIZA EL VALOR 12 VECES DURANTE ESA HORA
        */

        if (cmd == "bolsa") {
            var acciones = await bolsaModel.find({})
            var fields = []
            var config = {
                type: 'line',
                data: {
                    datasets: []
                }
            }
            for (let i = 0; i < acciones.length; i++) {
                var stock = acciones[i]
                config.data.datasets.push({ label: stock.nombre, data: stock.historico.toObject() })
                fields.push({ name: stock.nombre, value: String(getValorEmpresa(stock)) + "<:udyrcoin:961729720104419408>", inline: true })
            }
            if (fields.length % 2 != 0) {
                fields.push({ name: '\u200B', value: '\u200B', inline: true })
            }
            var hoy = new Date()
            var labels = []
            for (let i = 0; i < acciones[0].historico.length; i++) {
                var dateLabels = moment(hoy).add(-hoy.getMinutes(), "minutes")
                var date = dateLabels.add(-acciones[0].historico.length + 1 + i, "hours").toDate()
                labels.push(String(date.getHours()).padStart(2, "0") + ":00")
            }
            config.data["labels"] = labels
            const chart = new QuickChart();
            chart.setConfig(config)
            var url = await chart.getUrl()
            const chartEmbed = {
                title: 'Registro ultimas 12 horas',
                fields: fields,
                image: {
                    url: url,
                }
            };
            message.channel.send({ embeds: [chartEmbed] });
        }
        /**
         * udyr comprar nombreDeAccion cantidad_de_acciones
         */
        if (cmd == "comprar") {
            if (args.length == 0) {
                return message.reply("No has escrito nada. " + superfalo)
            }
            var nombre = args[0]
            var stock = await bolsaModel.findOne({ nombre: nombre })
            if (!stock) {
                return message.reply("No existe esa compañia. " + superfalo)
            }
            var cantidad = args[1]
            if (isNaN(cantidad)) {
                return message.reply("No has aprobado matemáticas ni en primaria. " + superfalo)
            }
            if (cantidad <= 0) {
                return message.reply(`Has escrito una cantida invalida de acciones. ${superfalo}`)
            }
            cantidad = Number(cantidad)
            var valorEmpresa = getValorEmpresa(stock)
            var dineroAGastar = valorEmpresa * cantidad
            if (profileData.udyrcoins < dineroAGastar) {
                return message.reply(`No tienes dinero para comprar tantas acciones de esa empresa. ${superfalo}`)
            }
            var wallet = profileData.wallet ? profileData.wallet : new Map()
            if (wallet.get(nombre)) {
                wallet.set(nombre, wallet.get(nombre) + cantidad)
            } else {
                wallet.set(nombre, cantidad)
            }
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: {
                    wallet: wallet
                },
                $inc: {
                    udyrcoins: -dineroAGastar
                }
            })
            message.channel.send(`Has comprado ${cantidad} ${nombre}${cantidad > 1 ? "s" : ""}!`)
        }
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}
function getValorEmpresa(stock) {
    var t1 = new Date()
    t1.setSeconds(0)
    t1.setMilliseconds(0)
    while (t1.getMinutes() % 5 != 0) {
        t1 = moment(t1).add(-1, "minutes").toDate()
    }
    var dateFinal = stock.dateFinal
    var valorInicial = stock.valorInicial
    var valorFinal = stock.valorFinal
    var random = stock.random
    var timestep = Math.floor((((dateFinal - t1) / 1000) / 60) / 5)
    var valorActual = Math.floor(valorInicial + (valorFinal - valorInicial) / 12 * (12 - timestep) + random)
    return valorActual
}