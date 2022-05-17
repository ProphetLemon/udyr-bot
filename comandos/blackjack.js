const { Message, Client, MessageEmbed } = require('discord.js');
const profileModel = require('../models/profileSchema');
const impuestoModel = require('../models/impuestoSchema')
var games = new Map()
var timeouts = new Map()
module.exports = {
    name: 'blackjack',
    aliases: ['carta', 'paso', 'pasar', 'plantar', 'doblar', 'planto', 'bj'],
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
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (message.channel.id != "975840889450672168") {
            return message.channel.send("Eso mejor en el canal de 'blackjack' del server").then(msg => {
                setTimeout(() => {
                    msg.delete()
                }, 6000);
            })
        }
        if (cmd == "blackjack" || cmd == "bj") {
            if (args.join("").trim() == "") {
                return message.channel.send("**COMO SE JUEGA:**\n"
                    + "**OBJETIVO:**" + "\n"
                    + "Robar cartas hasta sumar en total 21 o acercarte lo máximo posible a ese valor sin parte o pierdes.\nLas figuras cuentan como 10 y los ases valen 1 o 11 (está scripteado de tal manera que te cogera el valor adecuado para tu situación)." + "\n"
                    + "**CREAR PARTIDA:**" + "\n"
                    + "Las partidas duran 10 min, si tardas más de eso en jugar la partida se cerrará automaticamente y tendrás que crear otra." + "\n"
                    + "udyr blackjack _dinero a apostar_ (Ejemplo: udyr blackjack 100)" + "\n"
                    + "**COMO JUGAR:**" + "\n"
                    + "Tienes varias opciones" + "\n"
                    + "carta (Se te dará una carta más)" + "\n"
                    + "paso/pasar/plantar/planto (Te plantas y le toca a Udyr coger cartas hasta ganarte o perder)" + "\n"
                    + "doblar (Coges una ultima carta y doblas tu apuesta)" + "\n"
                )
            }
            if (games.get(message.author.id)) {
                return message.reply("Ya tienes una partida empezada")
            }
            var dinero = args[0]
            if (isNaN(dinero)) {
                return message.reply("No has escrito un numero valido de apuesta")
            } else {
                dinero = Math.floor(Number(dinero))
                if (dinero <= 0) {
                    return message.reply("No puedes poner un numero menor o igual que 0")
                }
                if (dinero > profileData.udyrcoins) {
                    return message.reply("No tienes ese dinero. Si quieres aumentar tu saldo de udyrcoin haz un ingreso de 10€ en esta cuenta https://paypal.me/Superfalo")
                }
            }
            var baraja = getBaraja()
            var cartaTuya1 = getCarta(baraja)
            var cartaTuya2 = getCarta(baraja)
            var cartaUdyr = getCarta(baraja)
            var partida = {
                user: {
                    name: message.member.displayName,
                    cartas: [cartaTuya1, cartaTuya2],
                    blackjack: false
                },
                udyr: {
                    name: 'Udyr',
                    cartas: [cartaUdyr]
                },
                baraja: baraja,
                dinero: dinero
            }
            getResultado(message, partida)
            if (getValorMano(partida.user.cartas) == 21) {
                message.channel.send("**BLACKJACK**")
                partida.user.blackjack = true
            }
            games.set(message.author.id, partida)
            var timeout = setTimeout((partida, userID) => {
                message.channel.send(`La partida de ${partida.user.name} se ha terminado porque se acabó el tiempo`)
                games.delete(userID)
                timeouts.delete(userID)
            }, 10 * 60 * 1000, partida, message.author.id);
            timeouts.set(message.author.id, timeout)
        } else if (cmd == "carta") {
            if (!games.get(message.author.id)) {
                return message.reply("No tienes una partida empezada")
            }
            var partida = games.get(message.author.id)
            var baraja = partida.baraja
            var cartaTuya = getCarta(baraja)
            partida.user.cartas.push(cartaTuya)
            if (getValorMano(partida.user.cartas) > 21) {
                finalPartida(message, partida)
            } else {
                getResultado(message, partida)
            }
        } else if (cmd == "paso" || cmd == "pasar" || cmd == "plantar" || cmd == "planto") {
            if (!games.get(message.author.id)) {
                return message.reply("No tienes una partida empezada")
            }
            var partida = games.get(message.author.id)
            juegaUdyr(partida)
            finalPartida(message, partida)
        } else if (cmd == "doblar") {
            if (!games.get(message.author.id)) {
                return message.reply("No tienes una partida empezada")
            }
            var partida = games.get(message.author.id)
            if (profileData.udyrcoins < partida.dinero * 2) {
                return message.reply("No puedes doblar la apuesta porque no tienes tanto dinero")
            }
            partida.dinero = partida.dinero * 2
            var baraja = partida.baraja
            var cartaTuya = getCarta(baraja)
            partida.user.cartas.push(cartaTuya)
            if (getValorMano(partida.user.cartas) > 21) {
                finalPartida(message, partida)
            } else {
                juegaUdyr(partida)
                finalPartida(message, partida)
            }
        }
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}
function juegaUdyr(partida) {
    var baraja = partida.baraja
    do {
        var cartaUdyr = getCarta(baraja)
        partida.udyr.cartas.push(cartaUdyr)
    } while (getValorMano(partida.udyr.cartas) < getValorMano(partida.user.cartas) && getValorMano(partida.udyr.cartas) < 21)
}
/**
 * 
 * @param {Message} message 
 * @param {*} partida 
 * @returns 
 */
async function finalPartida(message, partida) {
    getResultado(message, partida)
    games.delete(message.author.id)
    clearTimeout(timeouts.get(message.author.id))
    timeouts.delete(message.author.id)
    if (getValorMano(partida.udyr.cartas) > 21) {
        var dineroGanado = partida.user.blackjack ? Math.floor(partida.dinero * 1.5) : partida.dinero
        await darDinero(message, dineroGanado)
        return message.reply(`Has ganado! Te llevas ${dineroGanado} udyrcoins`)
    } else if (getValorMano(partida.udyr.cartas) == getValorMano(partida.user.cartas)) {
        return message.reply(`Has empatado y te quedas con los ${partida.dinero} udyrcoins`)
    } else {
        await darDinero(message, -(partida.dinero))
        await impuestoModel.findOneAndUpdate({
            serverID: message.guild.id
        }, {
            $inc: {
                udyrcoins: partida.dinero
            }
        })
        return message.reply(`Has perdido ${partida.dinero} udyrcoins`)
    }
}

/**
 * 
 * @param {Message} message 
 * @param {Number} dinero 
 */
async function darDinero(message, dinero) {
    await profileModel.findOneAndUpdate({
        userID: message.author.id,
        serverID: message.guild.id
    }, {
        $inc: {
            udyrcoins: dinero
        }
    })
}

function getResultado(message, partida) {
    newEmbed = new MessageEmbed().setTitle(`PARTIDA DE BLACKJACK DE ${message.member.displayName.toUpperCase()}`).addFields(
        { name: `Mano de ${message.member.displayName}`, value: `${partida.user.cartas.join(" ")}`, inline: true },
        { name: `Total`, value: String(getValorMano(partida.user.cartas)), inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: `Mano de Udyr`, value: `${partida.udyr.cartas.join(" ")}`, inline: true },
        { name: `Total`, value: String(getValorMano(partida.udyr.cartas)), inline: true },
    )
    message.channel.send({ embeds: [newEmbed] })
}
/**
 * 
 * @param {String[]} cartas 
 * @returns 
 */
function getValorMano(cartas) {
    var total = 0
    var ases = 0
    for (let i = 0; i < cartas.length; i++) {
        var numero = cartas[i].split(":")[0]
        if (numero == "A") {
            ases += 1
        } else if (numero == "K" || numero == "Q" || numero == "J") {
            total += 10
        } else {
            total += Number(numero)
        }
    }
    for (let i = 0; i < ases; i++) {
        total += total + 11 > 21 ? 1 : 11
    }
    return total
}
function getCarta(baraja) {
    var posicion = metodosUtiles.getRandom(baraja.length - 1)
    var carta = baraja[posicion]
    baraja.splice(posicion, 1)
    return carta
}
function getBaraja() {
    return [
        "A:spades:",
        "2:spades:",
        "3:spades:",
        "4:spades:",
        "5:spades:",
        "6:spades:",
        "7:spades:",
        "8:spades:",
        "9:spades:",
        "10:spades:",
        "J:spades:",
        "Q:spades:",
        "K:spades:",
        "A:hearts:",
        "2:hearts:",
        "3:hearts:",
        "4:hearts:",
        "5:hearts:",
        "6:hearts:",
        "7:hearts:",
        "8:hearts:",
        "9:hearts:",
        "10:hearts:",
        "J:hearts:",
        "Q:hearts:",
        "K:hearts:",
        "A:diamonds:",
        "2:diamonds:",
        "3:diamonds:",
        "4:diamonds:",
        "5:diamonds:",
        "6:diamonds:",
        "7:diamonds:",
        "8:diamonds:",
        "9:diamonds:",
        "10:diamonds:",
        "J:diamonds:",
        "Q:diamonds:",
        "K:diamonds:",
        "A:clubs:",
        "2:clubs:",
        "3:clubs:",
        "4:clubs:",
        "5:clubs:",
        "6:clubs:",
        "7:clubs:",
        "8:clubs:",
        "9:clubs:",
        "10:clubs:",
        "J:clubs:",
        "Q:clubs:",
        "K:clubs:"
    ]
}
