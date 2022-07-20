const { Message, Client, EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');
const bolsaModel = require('../models/bolsaSchema')
const profileModel = require('../models/profileSchema')
const impuestoModel = require('../models/impuestoSchema')
const superfalo = "Has considerado que en vez de malgastar el dinero en bolsa debas meter 10 € en https://www.paypal.me/Superfalo ?"
const QuickChart = require('quickchart-js');
module.exports = {
    name: 'bolsa',
    aliases: [],
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
                if (message.guild) {
                    message.delete()
                }
                setTimeout(() => {
                    msg.delete()
                }, 8000);
            })
        }
        if (args.length == 0) {
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
                if (stock.color) {
                    config.data.datasets.push({ label: stock.nombre, data: stock.historico.toObject(), backgroundColor: "transparent", borderColor: stock.color })
                }
                else {
                    config.data.datasets.push({ label: stock.nombre, data: stock.historico.toObject(), backgroundColor: "transparent" })
                }
                fields.push({ name: `${stock.nombre} (${getPorcentaje(stock)}%)`, value: String(getValorEmpresa(stock)) + "<:udyrcoin:961729720104419408>", inline: true })
            }
            if (fields.length % 2 == 0) {
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
            url = url.split("chart?").join("chart?bkg=%231f2933&")
            var dateUltimoRegistro = new Date()
            while (dateUltimoRegistro.getMinutes() % 5 != 0) {
                dateUltimoRegistro = moment(dateUltimoRegistro).add(-1, "minutes").toDate()
            }
            const chartEmbed = {
                title: 'Registro ultimas 12 horas',
                fields: fields,
                image: {
                    url: url,
                },
                description: `**Valores de la bolsa a las ${String(dateUltimoRegistro.getHours()).padStart(2, "0")}:${String(dateUltimoRegistro.getMinutes()).padStart(2, "0")}**`
            };
            message.channel.send({ embeds: [chartEmbed] });
        } else {
            cmd = args[0]
            args.splice(0, 1)
        }
        if (cmd == "crear") {
            //udyr bolsa crear patatafrita 2000 (minimo)
            var acciones = await bolsaModel.find({})
            if (acciones.length >= 8) {
                return message.reply("Ya hay muchas monedas bro, espera a que desaparezca alguna")
            }
            var nombre = args[0]
            var dineroInicial = args[1]
            if (isNaN(dineroInicial)) {
                return message.reply("")
            }
            dineroInicial = Math.floor(dineroInicial)
            if (dineroInicial <= 0) {
                return message.reply("Pon un valor valido anda")
            }
            dineroInicial = dineroInicial > 20_000 ? 20_000 : dineroInicial
            if (profileData.udyrcoins < dineroInicial || profileData.udyrcoins < 1000) {
                return message.reply("No tienes dinero suficiente")
            }
            var color = null
            if (args.length == 3) {
                if (/^#[0-9A-F]{6}$/i.test(args[2])) {
                    color = args[2]
                }
            }
            var dateFinal = new Date()
            dateFinal = moment(dateFinal).add(1, "hours").add(-dateFinal.getMinutes(), "minutes")
                .add(-dateFinal.getSeconds(), "seconds").add(-dateFinal.getMilliseconds(), "milliseconds").toDate()
            var historico = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, dineroInicial]
            var accionNueva = await bolsaModel.create({
                nombre: nombre,
                valorInicial: dineroInicial,
                valorFinal: dineroInicial,
                dateFinal: dateFinal,
                historico: historico,
                color: color
            })
            await accionNueva.save()
            await configurarAccion(accionNueva)
            var wallet = profileData.wallet ? profileData.wallet : new Map()
            if (wallet.get(nombre)) {
                wallet.set(nombre, wallet.get(nombre) + 1)
            } else {
                wallet.set(nombre, 1)
            }
            await profileModel.findOneAndUpdate({
                userID: message.member.id,
                serverID: message.guild.id
            }, {
                $set: {
                    wallet: wallet
                },
                $inc: {
                    udyrcoins: -dineroInicial
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: dineroInicial
                }
            })
            return message.reply(`Has creado la moneda **${accionNueva.nombre}** correctamente!`)
        }
        if (cmd == "historial") {
            if (profileData.historial.toObject().length == 0) {
                return message.reply("No tienes ninguna transacción reciente")
            }
            var historial = profileData.historial.toObject()
            var mensaje = historial.join("\n")
            while (mensaje.length > 2000) {
                historial.splice(0, 1)
                mensaje = historial.join("\n")
            }
            return message.author.send(mensaje).then(msg => {
                if (message.guild) {
                    message.delete()
                }
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
            if (valorEmpresa <= 0) {
                return message.reply("La bolsa no permite la compra de este activo por ahora.")
            }
            var dineroAGanar = valorEmpresa * cantidad
            wallet.set(nombre, wallet.get(nombre) - cantidad)
            if (wallet.get(nombre) == 0) {
                wallet.delete(nombre)
            }
            var historial = profileData.historial
            historial.push(`${moment().format('DD/MM HH:mm')}- Has vendido ${cantidad} ${nombre}${cantidad > 1 ? "s" : ""} por ${dineroAGanar} (la acción estaba a ${valorEmpresa}<:udyrcoin:961729720104419408>)`)
            if (historial.length == 11) {
                historial.splice(0, 1)
            }
            await bolsaModel.findOneAndUpdate({
                nombre: stock.nombre
            }, {
                $set: {
                    valorFinal: Math.floor(stock.valorFinal - 0.1 * valorEmpresa * Math.log10(cantidad))
                }
            })
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: {
                    wallet: wallet,
                    historial: historial
                },
                $inc: {
                    udyrcoins: Math.floor(dineroAGanar * 0.95)
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: -Math.floor(dineroAGanar * 0.95) + Math.floor(dineroAGanar * 0.05)
                }
            })
            message.channel.send(`Has vendido ${cantidad} ${nombre}${cantidad > 1 ? "s" : ""}!\nAhora cuentas con ${profileData.udyrcoins + Math.floor(dineroAGanar * 0.95)} (recarga del 5%: ${Math.floor(dineroAGanar * 0.05)}) <:udyrcoin:961729720104419408> en tu perfil`)
        }
        if (cmd == "acciones") {
            var author
            if (message.mentions.users.first()) {
                author = message.mentions.users.first()
                var mentionData = await profileModel.findOne({
                    userID: author.id,
                    serverID: message.guild.id
                })
                if (mentionData) {
                    profileData = mentionData
                }
                else {
                    return message.reply("Ese no ta en la BBDD")
                }
            } else {
                author = message.author
            }
            var acciones = profileData.wallet
            if (acciones) {
                var newEmbed = new EmbedBuilder()
                newEmbed.setTitle(`Acciones de ${author.username}`)
                newEmbed.setThumbnail(author.displayAvatarURL({ format: "png" }))
                var arrayDatos = []
                for (var [key, value] of acciones) {
                    //newEmbed.addFields(key, String(value), true)
                    var objeto = { name: key, value: String(value), inline: true }
                    arrayDatos.push(objeto)
                }
                newEmbed.setFields(arrayDatos)
                message.channel.send({ embeds: [newEmbed] })
            } else {
                message.reply("No tienes nada comprado")
            }
        }

        /**
        * PRECIO FINAL CADA HORA
        * SE ACTUALIZA EL VALOR 12 VECES DURANTE ESA HORA
        */


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
            if (valorEmpresa <= 0) {
                return message.reply("La bolsa no permite la compra de este activo por ahora.")
            }
            var dineroAGastar = valorEmpresa * cantidad
            while (profileData.udyrcoins < dineroAGastar) {
                cantidad = cantidad - 1
                if (cantidad == 0) {
                    return message.reply("Subnormal, no tienes dinero ni pa 1. " + superfalo)
                }
                dineroAGastar = valorEmpresa * cantidad
            }
            var wallet = profileData.wallet ? profileData.wallet : new Map()
            if (wallet.get(nombre)) {
                wallet.set(nombre, wallet.get(nombre) + cantidad)
            } else {
                wallet.set(nombre, cantidad)
            }
            var historial = profileData.historial
            historial.push(`${moment().format('DD/MM HH:mm')}- Has comprado ${cantidad} ${nombre}${cantidad > 1 ? "s" : ""} por ${dineroAGastar} (la acción estaba a ${valorEmpresa}<:udyrcoin:961729720104419408>)`)
            if (historial.length == 11) {
                historial.splice(0, 1)
            }
            await bolsaModel.findOneAndUpdate({
                nombre: stock.nombre
            }, {
                $set: {
                    valorFinal: Math.floor(stock.valorFinal + 0.1 * valorEmpresa * Math.log10(cantidad))
                }
            })
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: {
                    wallet: wallet,
                    historial: historial
                },
                $inc: {
                    udyrcoins: -dineroAGastar
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: dineroAGastar
                }
            })
            message.channel.send(`Has comprado ${cantidad} ${nombre}${cantidad > 1 ? "s" : ""}!\nAhora cuentas con ${profileData.udyrcoins - dineroAGastar} <:udyrcoin:961729720104419408> en tu perfil`)
        }
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}

function getPorcentaje(stock) {
    var i = -1
    do {
        i++
    } while (stock.historico[i] == 0)
    return `${stock.historico[i] > stock.historico[11] ? "-" : "+"}${Math.floor(Math.abs(100 - ((stock.historico[11] * 100) / stock.historico[i])))}`
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