const { Client, Discord, Guild } = require("discord.js");
const profileModel = require('../../models/profileSchema');
const roboModel = require('../../models/roboSchema');
const loteriaModel = require('../../models/loteriaSchema')
const boletoModel = require('../../models/boletoSchema');
const impuestoModel = require('../../models/impuestoSchema')
const bolsaModel = require('../../models/bolsaSchema')
const payoutModel = require('../../models/payoutSchema')
/**
 * @param {Discord} Discord
 * @param {Client} client
 */
module.exports = async (Discord, client) => {
    client.user.setPresence({
        status: "dnd",
        activities: [{ name: 'minar udyrcoins 💰', type: "PLAYING" }]
    })
    console.log("El bot ta ready");
    var guild = client.guilds.cache.get("598896817157046281")
    const textChannel = guild.channels.cache.find(channel => channel.id === "809786674875334677" && channel.isText())
    robos(guild, textChannel)
    var loteriaBBDD = await loteriaModel.findOne({ serverID: guild.id })
    if (loteriaBBDD) {
        configurarLoteria(guild, textChannel, loteriaBBDD)
    }
    configurarBolsa()
    configurarPayout(guild)
}

/**
 * 
 * @param {Guild} guild 
 */
async function configurarPayout(guild) {
    var payout = await payoutModel.findOne({ serverID: guild.id })
    var hoy = new Date()
    if (!payout) {
        var datePago = new Date()
        datePago.setHours(12)
        datePago.setMinutes(30)
        datePago.setSeconds(0)
        datePago.setMilliseconds(0)
        let model = await payoutModel.create({
            serverID: guild.id,
            datePago: datePago
        })
        await model.save()
        payout = await payoutModel.findOne({ serverID: guild.id })
    }
    setTimeout(async (guild) => {
        var personas = await profileModel.find({ wallet: { $ne: null } })
        var bolsaChannel = guild.channels.cache.find(channel => channel.id === "976611174915375174" && channel.isText())
        for (let i = 0; i < personas.length; i++) {
            var persona = personas[i]
            var wallet = persona.wallet
            var dinero = 0
            for (var [key, value] of wallet) {
                var stock = await bolsaModel.findOne({ nombre: key })
                var valorEmpresa = getValorEmpresa(stock)
                dinero += Math.floor(valorEmpresa * value * 0.05)
            }
            bolsaChannel.send(`<@${persona.userID}>, han pasado dos días y los dividendos de tus acciones te han otorgado ${dinero}<:udyrcoin:961729720104419408>`)
            await profileModel.findOneAndUpdate({
                serverID: persona.serverID,
                userID: persona.userID
            }, {
                $inc: {
                    udyrcoins: dinero
                }
            })
        }
        await payoutModel.findOneAndUpdate({
            serverID: guild.id
        }, {
            datePago: moment().add(2, "days").toDate()
        })
        configurarPayout(guild)
    }, payout.datePago - hoy, guild);
    console.log("Se han configurado los pagos")
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
async function configurarAccion(accion) {
    var t1 = new Date()
    var dateFinal = accion.dateFinal
    setTimeout(async (accion) => {
        var dateFinal = accion.dateFinal
        var valorFinal = accion.valorFinal
        if (valorFinal <= 0) {
            await borrar(accion)
            return
        }
        var nombre = accion.nombre
        var random = accion.random
        var historico = accion.historico
        historico.push(valorFinal)
        if (historico.length == 13) {
            historico.splice(0, 1)
        }
        var desplome = Math.floor(Math.random() * 8000) == 11 ? true : false
        var toTheMoon = Math.floor(Math.random() * 8000) == 11 ? true : false
        var proximoValor = desplome ? Math.floor(valorFinal / 2) : toTheMoon ? Math.floor(valorFinal * 2) : Math.floor(valorFinal + random + (randn_bm(0, 2000, 1) - 1000))
        if (proximoValor < 0) {
            proximoValor = 0
        }
        do {
            var dateFinal = moment(dateFinal).add(1, "hours").toDate()
        } while (dateFinal < t1)
        dateFinal.setSeconds(0)
        dateFinal.setMilliseconds(0)
        await bolsaModel.findOneAndUpdate({
            nombre: nombre
        }, {
            $set: {
                dateFinal: dateFinal,
                valorInicial: valorFinal,
                valorFinal: proximoValor,
                historico: historico
            }
        })
        accion = await bolsaModel.findOne({
            nombre: nombre
        })
        await configurarAccion(accion)
    }, dateFinal - t1, accion);
    actualizarRandom(t1, accion)
    console.log(`${accion.nombre} configurado!`)
}
async function configurarBolsa() {
    var acciones = await bolsaModel.find({})
    for (let i = 0; i < acciones.length; i++) {
        var accion = acciones[i]
        await configurarAccion(accion)
    }
}

async function borrar(stock) {
    await bolsaModel.findOneAndRemove({
        nombre: stock.nombre
    })
    var personas = await profileModel.find({
        $and: [
            { wallet: { $ne: null } },
            { wallet: { $ne: [] } }
        ]
    })
    for (let i = 0; i < personas.length; i++) {
        var persona = personas[i]
        var wallet = persona.wallet
        if (wallet.get(stock.nombre)) {
            wallet.delete(stock.nombre)
            await profileModel.findOneAndUpdate({
                userID: persona.userID,
                serverID: persona.serverID
            }, {
                $set: {
                    wallet: wallet
                }
            })
        }
    }
}


function actualizarRandom(t1, stock) {
    var dateActualizarRandom = moment(t1).toDate()
    dateActualizarRandom = moment(dateActualizarRandom).add(1, "minutes").toDate()
    while (dateActualizarRandom.getMinutes() % 5 != 0) {
        dateActualizarRandom = moment(dateActualizarRandom).add(1, "minutes").toDate()
    }
    dateActualizarRandom.setSeconds(0)
    dateActualizarRandom.setMilliseconds(0)
    setTimeout(async (stock) => {
        var random = stock.valorFinal <= 0 ? 0 : Math.floor(randn_bm(0, 600, 1)) - 300
        if (stock.valorFinal + random <= 0) {
            random = -stock.valorFinal
        }
        await bolsaModel.findOneAndUpdate({
            nombre: stock.nombre
        }, {
            $set: {
                random: random
            }
        })
        actualizarRandom(new Date(), stock)
    }, dateActualizarRandom - t1, stock);
}

function randn_bm(min, max, skew) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random()
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0)
        num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range

    else {
        num = Math.pow(num, skew) // Skew
        num *= max - min // Stretch to fill range
        num += min // offset to min
    }
    return num
}

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
    }, 5000);
}

async function configurarLoteria(guild, textChannel, loteriaBBDD) {
    console.log("Configurando loteria")
    var dateNow = new Date()
    var dateLoteria = new Date()
    dateLoteria.setDate(loteriaBBDD.dia.getDate())
    dateLoteria.setHours(loteriaBBDD.dia.getHours())
    dateLoteria.setMinutes(loteriaBBDD.dia.getMinutes())
    dateLoteria.setFullYear(loteriaBBDD.dia.getFullYear())
    dateLoteria.setSeconds(0)
    var diff = dateLoteria - dateNow
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
        discurso.push("BIENVENIDOS A LA LOTERIA DE UDYR")
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
        var dineroPrimerPremio = 60000
        var dineroSegundoPremio = 25000
        var tercerPremio = 15000
        var dineroTotal = dineroPrimerPremio + dineroSegundoPremio + tercerPremio
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
            $inc: {
                udyrcoins: -dineroTotal
            }
        })
        await boletoModel.remove({})
        await loteriaModel.remove({ serverID: guild.id })
    }, diff);
    loteria.set(guild.id, timeout)
    console.log("Loteria configurada!")
}

async function robos(guild, textChannel) {
    console.log("Comprobando robos")
    var robos = await roboModel.find()
    for (let i = 0; i < robos.length; i++) {
        var robo = robos[i]
        if (!listaRobos.get(robo.userIDLadron)) {
            var profile = await profileModel.findOne({
                serverID: guild.id,
                userID: robo.userIDLadron
            })
            var dateNow = moment().toDate()
            var diff = moment(profile.robar).add(12, 'hours').toDate() - dateNow
            if (diff > 0) {
                var timeout = setTimeout(async (robo) => {
                    listaRobos.delete(robo.userIDLadron)
                    await profileModel.findOneAndUpdate({
                        userID: robo.userIDLadron,
                        serverID: guild.id
                    }, {
                        $inc: {
                            udyrcoins: robo.dinero
                        }
                    })
                    await roboModel.findOneAndRemove({
                        userIDLadron: robo.userIDLadron
                    })
                    textChannel.send(`Han pasado 12 horas asi que <@!${robo.userIDLadron}> ha robado ${robo.dinero} <:udyrcoin:961729720104419408> a <@!${robo.userIDAfectado}>`)
                }, diff, robo);
                listaRobos.set(robo.userIDLadron, timeout)
            } else {
                await profileModel.findOneAndUpdate({
                    userID: robo.userIDLadron,
                    serverID: guild.id
                }, {
                    $inc: {
                        udyrcoins: robo.dinero
                    }
                })
                await roboModel.findOneAndRemove({
                    userIDLadron: robo.userIDLadron
                })
                textChannel.send(`Han pasado 12 horas asi que <@!${robo.userIDLadron}> ha robado ${robo.dinero} <:udyrcoin:961729720104419408> a <@!${robo.userIDAfectado}>`)
            }
        }
    }
    console.log("Se han comprobado los robos gucci")
}