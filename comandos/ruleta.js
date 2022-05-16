const { Message, Client } = require('discord.js');
const profileModel = require('../models/profileSchema');
const impuestoModel = require('../models/impuestoSchema')
module.exports = {
    name: 'ruleta',
    aliases: ['roulette', 'apuesta', 'apostar'],
    description: 'Funcion que sirve para tirar en la ruleta',
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
        /**
         * PAR (NO VALE 0)
         * IMPAR
         * AREA
         * COLOR
         * PRIMER TERCIO 1-12 1T
         * SEGUNDO 13-24      2T
         * TERCERO 25-36      3T
         * 1C/2C/3C
         * PRIMERA/SEGUNDA MITAD     1M/2M
         * (dinero-apostado/posibilidades-elegidas)*36
         * 
         * 
         *  56161 (15) 32424 (par) 4535 (12-34) 15618 (1c)
         */
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (message.channel.id != "975690578333405204") {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("Esto mejor en el canal de 'ruleta'").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 6000);
            })
        }
        var apuestas = args.join(" ").toLowerCase()
        if (apuestas.trim() == "") {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send({
                files: ['./images/ruleta.png'], content: "**COMO SE JUEGA:**\n"
                    + "udyr ruleta _dinero_ (_tipoApuesta_)\n"
                    + "Ejemplo: udyr ruleta 100 (rojo)\n"
                    + "**TIPOS DE APUESTA:**\n"
                    + "rojo/negro" + "\n"
                    + "par/impar" + "\n"
                    + "un numero en concreto" + "\n"
                    + "un grupo de numeros (Ejemplo: 14-23)" + "\n"
                    + "1T/2T/3T" + "\n"
                    + "1M/2M" + "\n"
                    + "1C/2C/3C" + "\n"
                    + "**IMPORTANTE: **" + "Puedes hacer varias apuestas a la misma tirada (Ejemplo: udyr ruleta 56161 (15) 32424 (par) 4535 (12-34) 15618 (1c))"
            })
        }
        var numeroRandom = Math.floor(Math.random() * 37)
        var tirada = numeroRandom + "-" + RULETA.get(numeroRandom)
        do {
            profileData = await profileModel.findOne({
                serverID: message.guild.id,
                userID: message.author.id
            })
            if (apuestas.split("(").length == 1) {
                console.log(`FIN ${cmd.toUpperCase()}`)
                return message.reply("No has apostado a nada bobo")
            }
            var dinero = apuestas.split("(")[0]
            if (isNaN(dinero) || Number(dinero) < 0) {
                console.log(`FIN ${cmd.toUpperCase()}`)
                return message.reply("Has apostado una cantidad de dinero invalida")
            } else {
                dinero = Number(apuestas.split("(")[0])
            }
            if (profileData.udyrcoins < dinero) {
                console.log(`FIN ${cmd.toUpperCase()}`)
                return message.reply("Lo siento maricón pero te has quedado sin pasta")
            }
            var tipoApuesta = apuestas.split("(")[1].split(")")[0]
            await apuesta(message, tipoApuesta, dinero, tirada)
            apuestas = apuestas.substring(apuestas.indexOf(")") + 1, apuestas.length)
        } while (apuestas.indexOf("(") != -1)
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}

/**
 * 
 * @param {Message} message 
 * @param {string} tipoApuesta 
 * @param {Number} dinero 
 * @param {string} tirada 
 */
async function apuesta(message, tipoApuesta, dinero, tirada) {
    var numeroTirada = Number(tirada.split("-")[0])
    var colorTirada = tirada.split("-")[1]
    var columna = calcularColumna(numeroTirada)
    var resultado = false
    var dineroPosible = 0
    if (tipoApuesta == "impar") {
        resultado = numeroTirada % 2 != 0
        dineroPosible = dinero * 2
        await repartirDinero(message, resultado, dinero, dineroPosible)
        return message.reply(`Salió ${tirada} y apostaste a ${tipoApuesta}\n${resultado ? `Has ganado ${dineroPosible} udyrcoin! (Balance: ${dineroPosible - dinero})` : `Mejor suerte la proxima vez`}`)
    }
    if (tipoApuesta == "par") {
        resultado = numeroTirada % 2 == 0 && numeroTirada != 0
        dineroPosible = dinero * 2
        await repartirDinero(message, resultado, dinero, dineroPosible)
        return message.reply(`Salió ${tirada} y apostaste a ${tipoApuesta}\n${resultado ? `Has ganado ${dineroPosible} udyrcoin! (Balance: ${dineroPosible - dinero})` : `Mejor suerte la proxima vez`}`)
    }
    if (tipoApuesta == "rojo" || tipoApuesta == "negro") {
        resultado = colorTirada == tipoApuesta
        dineroPosible = dinero * 2
        await repartirDinero(message, resultado, dinero, dineroPosible)
        return message.reply(`Salió ${tirada} y apostaste a ${tipoApuesta}\n${resultado ? `Has ganado ${dineroPosible} udyrcoin! (Balance: ${dineroPosible - dinero})` : `Mejor suerte la proxima vez`}`)
    }
    if (isNaN(tipoApuesta) == false) {
        if (tipoApuesta < 0 || tipoApuesta > 36) {
            return message.reply("Ese numero no está dentro del rango de la ruleta")
        }
        resultado = numeroTirada == Number(tipoApuesta)
        dineroPosible = dinero * 36
        await repartirDinero(message, resultado, dinero, dineroPosible)
        return message.reply(`Salió ${tirada} y apostaste a ${tipoApuesta}\n${resultado ? `Has ganado ${dineroPosible} udyrcoin! (Balance: ${dineroPosible - dinero})` : `Mejor suerte la proxima vez`}`)
    }
    switch (tipoApuesta) {
        case "1t":
            tipoApuesta = "1-12"
            break;
        case "2t":
            tipoApuesta = "13-24"
            break;
        case "3t":
            tipoApuesta = "25-36"
            break;
        case "1m":
            tipoApuesta = "1-18"
            break;
        case "2m":
            tipoApuesta = "19-36"
            break;
    }
    if (tipoApuesta.split("-").length == 2) {
        var minimo = Number(tipoApuesta.split("-")[0])
        var maximo = Number(tipoApuesta.split("-")[1])
        if (minimo < 0 || maximo > 36) {
            return message.reply("Franja no valida")
        }
        var posibilidades = (maximo - minimo) + 1
        resultado = minimo <= numeroTirada && maximo >= numeroTirada
        dineroPosible = Math.floor((dinero / posibilidades) * 36)
        await repartirDinero(message, resultado, dinero, dineroPosible)
        return message.reply(`Salió ${tirada} y apostaste a ${tipoApuesta}\n${resultado ? `Has ganado ${dineroPosible} udyrcoin! (Balance: ${dineroPosible - dinero})` : `Mejor suerte la proxima vez`}`)
    }
    if (tipoApuesta == "1c" || tipoApuesta == "2c" || tipoApuesta == "3c") {
        resultado = tipoApuesta == columna
        dineroPosible = Math.floor((dinero / 12) * 36)
        await repartirDinero(message, resultado, dinero, dineroPosible)
        return message.reply(`Salió ${tirada} y apostaste a ${tipoApuesta}\n${resultado ? `Has ganado ${dineroPosible} udyrcoin! (Balance: ${dineroPosible - dinero})` : `Mejor suerte la proxima vez`}`)
    }
    return message.reply("No has puesto un tipo valido de apuesta")
}

async function repartirDinero(message, resultado, dinero, dineroPosible) {
    if (resultado) {
        var dineroGanado = dineroPosible - dinero
        await profileModel.updateOne({
            serverID: message.guild.id,
            userID: message.author.id
        }, {
            $inc: {
                udyrcoins: dineroGanado
            }
        })
    } else {
        await profileModel.updateOne({
            serverID: message.guild.id,
            userID: message.author.id
        }, {
            $inc: {
                udyrcoins: -dinero
            }
        })
        await impuestoModel.updateOne({
            serverID: message.guild.id
        }, {
            $inc: {
                udyrcoins: dinero
            }
        })
    }
}

function calcularColumna(numeroTirada) {
    var columna = numeroTirada
    while (columna > 3) {
        columna = columna - 3
    }
    switch (columna) {
        case 1:
            columna = "1c"
            break;
        case 2:
            columna = "2c"
            break;
        case 3:
            columna = "3c"
            break;
    }
    return columna
}
const RULETA = new Map([
    [0, 'verde'],
    [1, 'rojo'],
    [2, 'negro'],
    [3, 'rojo'],
    [4, 'negro'],
    [5, 'rojo'],
    [6, 'negro'],
    [7, 'rojo'],
    [8, 'negro'],
    [9, 'rojo'],
    [10, 'negro'],
    [11, 'negro'],
    [12, 'rojo'],
    [13, 'negro'],
    [14, 'rojo'],
    [15, 'negro'],
    [16, 'rojo'],
    [17, 'negro'],
    [18, 'rojo'],
    [19, 'rojo'],
    [20, 'negro'],
    [21, 'rojo'],
    [22, 'negro'],
    [23, 'rojo'],
    [24, 'negro'],
    [25, 'rojo'],
    [26, 'negro'],
    [27, 'rojo'],
    [28, 'negro'],
    [29, 'negro'],
    [30, 'rojo'],
    [31, 'negro'],
    [32, 'rojo'],
    [33, 'negro'],
    [34, 'rojo'],
    [35, 'negro'],
    [36, 'rojo']
])
