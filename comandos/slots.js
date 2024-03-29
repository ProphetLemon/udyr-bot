const { Message, Client, EmbedBuilder } = require('discord.js');
const DiscordAPI = require('discord.js');
var partidas = new Map()
const profileModel = require('../models/profileSchema');
const impuestoModel = require('../models/impuestoSchema')
module.exports = {
    name: 'tragaperra',
    aliases: ['tragaperras', 'tp', 'jp', 'jackpot', 'slot', 'slots'],
    description: 'Funcion para ver los valores en bolsa ahora mismo',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {DiscordAPI} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        return;
        return;
        //slot 200 3
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (message.channel.id != "980884990579572826") {
            return message.reply("Eso mejor en el canal de slots").then(msg => {
                if (message.guild) {
                    message.delete()
                    setTimeout(() => {
                        msg.delete()
                    }, 6000);
                }
            })
        }
        if (args == 0) {
            return message.channel.send("**JUEGO SLOTS/TRAGAPERRAS**\n" +
                "**INSTRUCCIONES**\n" +
                "Pon el numero de dinero de cada tirada y el numero de tiradas\n" +
                "O puedes poner 'max' y te hace una partida apostando todo tu dinero\n" +
                "**EJEMPLO**\n" +
                "udyr slots 200 3\n(200 de dineros * 3 tiradas = 600 de dineros en total te estás jugando)\n" +
                "udyr slots max")

        }
        if (args.length > 2) {
            return message.reply("Te sobran parametros\n**Ejemplos**:\n1-udyr slots 200 3\n2-udyr slots max)")
        }
        var dinero = 0
        var tiradas = 0
        if (args.length == 2) {
            if (isNaN(args[0]) || Number(args[0]) < 1) {
                return message.reply("cantidad de dinero invalida")
            }
            dinero = Math.floor(Number(args[0]))
            if (isNaN(args[1]) || Number(args[1]) < 1) {
                return message.reply("cantidad de tiradas invalida")
            }
            tiradas = Math.floor(Number(args[1]))
        } else if (args.length == 1) {
            if (args[0] == "max") {
                dinero = Math.ceil(profileData.udyrcoins / 500)
                tiradas = Math.floor(profileData.udyrcoins / dinero)
                if (dinero == 0 || tiradas == 0) {
                    return message.reply("Calla pobre de mierda")
                }
                message.reply(`Haciendo ${tiradas} tiradas a ${dinero}<:udyrcoin:961729720104419408> cada una.`)
            } else {
                return message.reply("Te faltan parametros\n**Ejemplos**:\n1-udyr slots 200 3\n2-udyr slots max")
            }
        }
        if (profileData.udyrcoins < (dinero * tiradas)) {
            return message.reply("No tienes esa cantidad de dinero bobo")
        }
        if (partidas.get(message.author.id)) {
            return message.reply("ya tienes un slot activo")
        }
        await profileModel.findOneAndUpdate({
            userID: message.author.id,
            serverID: message.guild.id
        }, {
            $inc: {
                udyrcoins: -(dinero * tiradas)
            }
        })
        await impuestoModel.findOneAndUpdate({
            serverID: message.guild.id
        }, {
            $inc: {
                udyrcoins: (dinero * tiradas)
            }
        })
        var partida = {
            rueda1: getRueda(),
            rueda2: getRueda(),
            rueda3: getRueda(),
            channel: undefined,
            message: message,
            dinero: dinero,
            dineroGanado: undefined,
            tiradas: tiradas
        }
        partida.channel = await createChannel(partida.message)
        partida.channel.send(`<@${message.author.id}>`)
        partidas.set(message.author.id, partida)
        partida.dineroGanado = -(dinero * tiradas)
        for (let i = 0; i < tiradas; i++) {
            var resultado = await getResultadoSpin(partida)
            var mensaje = resultado[0]
            if (resultado[0].includes("Has ganado")) {
                partida.dineroGanado += resultado[1]
                await partida.channel.send(`Tirada ${(i + 1)} de <@${partida.message.member.id}> (${partida.tiradas - (i + 1)} restantes)\n${mensaje}\nBalance de ${partida.message.member.displayName}: ${partida.dineroGanado}<:udyrcoin:961729720104419408>`)
            } else {
                await partida.channel.send(`Tirada ${(i + 1)} de ${partida.message.member.displayName} (${partida.tiradas - (i + 1)} restantes)\n${mensaje}\nBalance de ${partida.message.member.displayName}: ${partida.dineroGanado}<:udyrcoin:961729720104419408>`)
            }

        }
        await partida.message.channel.send(`Balance de ${partida.message.member.displayName}: ${partida.dineroGanado}<:udyrcoin:961729720104419408>`)
        await partida.channel.send(`Balance final: ${partida.dineroGanado}<:udyrcoin:961729720104419408>`)
        setTimeout((message) => {
            partida.channel.delete()
            partidas.delete(message.author.id)
        }, 10000, partida.message);
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}

async function createChannel(message) {
    const channel = await message.guild.channels.create(`slots: ${message.author.tag}`, {
        type: 'GUILD_TEXT',
        parent: "975840789273903114",
        permissionOverwrites: [
            {
                id: message.guild.roles.everyone,
                deny: ["SEND_MESSAGES", "VIEW_CHANNEL"]
            },
            {
                id: message.author.id,
                allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
            }
        ]
    })
    return channel
}

async function getResultadoSpin(partida) {
    var dineroGanado = 0
    var mensaje = ""
    //RUEDA1
    var spinRueda1 = Math.floor(Math.random() * partida.rueda1.length)
    var spinArribaRueda1 = spinRueda1 - 1 < 0 ? partida.rueda1.length - 1 : spinRueda1 - 1
    var spinAbajoRueda1 = spinRueda1 + 1 == partida.rueda1.length ? 0 : spinRueda1 + 1
    //RUEDA2
    var spinRueda2 = Math.floor(Math.random() * partida.rueda1.length)
    var spinArribaRueda2 = spinRueda2 - 1 < 0 ? partida.rueda1.length - 1 : spinRueda2 - 1
    var spinAbajoRueda2 = spinRueda2 + 1 == partida.rueda1.length ? 0 : spinRueda2 + 1
    //RUEDA3
    var spinRueda3 = Math.floor(Math.random() * partida.rueda1.length)
    var spinArribaRueda3 = spinRueda3 - 1 < 0 ? partida.rueda1.length - 1 : spinRueda3 - 1
    var spinAbajoRueda3 = spinRueda3 + 1 == partida.rueda1.length ? 0 : spinRueda3 + 1
    //RESULTADO
    var filaArriba = partida.rueda1[spinArribaRueda1] + "|" + partida.rueda2[spinArribaRueda2] + "|" + partida.rueda3[spinArribaRueda3]
    var filaMedio = partida.rueda1[spinRueda1] + "|" + partida.rueda2[spinRueda2] + "|" + partida.rueda3[spinRueda3]
    var filaAbajo = partida.rueda1[spinAbajoRueda1] + "|" + partida.rueda2[spinAbajoRueda2] + "|" + partida.rueda3[spinAbajoRueda3]
    mensaje += "|" + filaArriba + "|\n"
        + "|" + filaMedio + "| <-linea premio\n"
        + "|" + filaAbajo + "|\n"
    switch (filaMedio) {
        case ":blue_heart:|:blue_heart:|:blue_heart:":
            mensaje += "Has ganado " + partida.dinero * 500 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 500
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 500)
                }
            })
            dineroGanado += partida.dinero * 500
            break;
        case ":heart:|:heart:|:heart:":
            mensaje += "Has ganado " + partida.dinero * 100 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 100
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 100)
                }
            })
            dineroGanado += partida.dinero * 100
            break;
        case ":green_heart:|:green_heart:|:green_heart:":
            mensaje += "Has ganado " + partida.dinero * 50 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 50
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 50)
                }
            })
            dineroGanado += partida.dinero * 50
            break;
        case ":bear:|:bear:|:bear:":
            mensaje += "Has ganado " + partida.dinero * 20 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 20
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 20)
                }
            })
            dineroGanado += partida.dinero * 20
            break;
        case ":bird:|:bird:|:bird:":
            mensaje += "Has ganado " + partida.dinero * 16 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 16
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 16)
                }
            })
            dineroGanado += partida.dinero * 16
            break;
        case ":turtle:|:turtle:|:turtle:":
            mensaje += "Has ganado " + partida.dinero * 12 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 12
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 12)
                }
            })
            dineroGanado += partida.dinero * 12
            break;
        case ":tiger:|:tiger:|:tiger:":
            mensaje += "Has ganado " + partida.dinero * 8 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 8
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 8)
                }
            })
            dineroGanado += partida.dinero * 8
            break;
        case ":monkey_face:|:monkey_face:|:monkey_face:":
            mensaje += "Has ganado " + partida.dinero * 4 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 4
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 4)
                }
            })
            dineroGanado += partida.dinero * 4
            break;
        case ":blue_heart:|:heart:|:green_heart:":
        case ":blue_heart:|:green_heart:|:heart:":
        case ":heart:|:blue_heart:|:green_heart:":
        case ":green_heart:|:blue_heart:|:heart:":
        case ":green_heart:|:heart:|:blue_heart:":
        case ":green_heart:|:heart:|:blue_heart:":
            mensaje += "Has ganado " + partida.dinero * 2 + "<:udyrcoin:961729720104419408>"
            await profileModel.findOneAndUpdate({
                userID: partida.message.author.id,
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: partida.dinero * 2
                }
            })
            await impuestoModel.findOneAndUpdate({
                serverID: partida.message.guild.id
            }, {
                $inc: {
                    udyrcoins: -(partida.dinero * 2)
                }
            })
            dineroGanado += partida.dinero * 2
            break;
        default:
            mensaje += "No has conseguido nada..."
    }
    return [mensaje, dineroGanado]
}

/**
 * 
 * @returns {string[]} array
 */
function getRueda() {
    var rueda = []
    rellenarArray(":blue_heart:", 2, rueda)
    rellenarArray(":heart:", 5, rueda)
    rellenarArray(":green_heart:", 7, rueda)
    rellenarArray(":bear:", 8, rueda)
    rellenarArray(":bird:", 9, rueda)
    rellenarArray(":turtle:", 10, rueda)
    rellenarArray(":tiger:", 11, rueda)
    rellenarArray(":monkey_face:", 12, rueda)
    return randomizeArray(rueda)
}
/**
 * 
 * @param {string} emoji 
 * @param {number} numero 
 * @param {string[]} array 
 */
function rellenarArray(emoji, numero, array) {
    for (let i = 0; i < numero; i++) {
        array.push(emoji)
    }
}
/**
 * 
 * @param {string[]} array 
 */
function randomizeArray(array) {
    var arrayRandom = []
    while (array.length > 0) {
        var random = Math.floor(Math.random() * array.length)
        arrayRandom.push(array[random])
        array.splice(random, 1)
    }
    return arrayRandom
}