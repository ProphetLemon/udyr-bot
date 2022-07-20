const { Message, Client, MessageAttachment, TextChannel } = require('discord.js');
const Discord = require('discord.js');
const fs = require('fs');
const { Canvacord } = require("canvacord");
const adminModel = require("../models/adminSchema");
const profileModel = require('../models/profileSchema');
var banquillo = [];
var combates = new Map()
var eventosRandom = ["MATRIX", "UDYR", "AMOR"];
const UDYRID = "849997112930074654"
class Gladiador {
    /**
     * 
     * @param {string} nombre 
     * @param {number} vida 
     * @param {string} id 
     */
    constructor(nombre, vida, id) {
        this.nombre = nombre
        this.vida = vida
        this.id = id
    }
}
class Admin {
    /**
     * 
     * @param {string} id 
     * @param {Date} dateLimite 
     */
    constructor(id, dateLimite) {
        this.id = id
        this.dateLimite = dateLimite
    }
}
class Partida {
    /**
     * 
     * @param {Gladiador} gladiador1 
     * @param {Gladiador} gladiador2 
     * @param {number} eventosRandom 
     * @param {string[]} logCombate 
     * @param {string} guildId 
     * @param {boolean} tituloEnJuego 
     * @param {TextChannel} channel 
     */
    constructor(gladiador1, gladiador2, eventosRandom, logCombate, guildId, tituloEnJuego, channel) {
        this.gladiador1 = gladiador1
        this.gladiador2 = gladiador2
        this.eventosRandom = eventosRandom
        this.logCombate = logCombate
        this.guildId = guildId
        this.tituloEnJuego = tituloEnJuego
        this.channel = channel
    }
}
const adminActual = new Admin(undefined, undefined)
module.exports = {
    name: 'retar',
    aliases: ['pelea', 'coliseo'],
    description: 'Funcion para retar a alguien',
    /**
     * 
     * @param {Message} message 
     * @param {[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {Discord} Discord 
     * @param {*} profileData 
     * @returns 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (adminActual.id == undefined) {
            var adminBBDD = await adminModel.findOne({ serverID: message.guild.id })
            adminActual.dateLimite = adminBBDD.dateLimite
            adminActual.id = adminBBDD.id
        }
        if (message.mentions.members.size > 1) {
            var sustituto = message.mentions.members.get(message.mentions.members.keyAt(1))
            var gladiador1 = new Gladiador(sustituto.displayName, 100, sustituto.id)
        } else if (message.mentions.members.size == 0) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("Tienes que mencionar a alguien")
        } else {
            var gladiador1 = new Gladiador(message.member.displayName, 100, message.member.id)
        }
        var target = message.mentions.members.first()
        var gladiador2 = new Gladiador(target.displayName, 100, target.id)
        var partida = new Partida(gladiador1, gladiador2, 0, [], message.guild.id, (gladiador1.id == adminActual.id || gladiador2.id == adminActual.id) && gladiador1.id == message.member.id, message.channel)
        if (partida.tituloEnJuego) {
            for (let i = 0; i < banquillo.length; i++) {
                if (banquillo[i] == gladiador1.id) {
                    return message.reply("Ya has peleado recientemente contra el admin, tienes que esperar 30 min desde la ultima vez que le retaste.")
                }
            }
        }
        message.delete()
        combates.set(partida.guildId, partida)
        combate(partida, 1)
        leerRondasPelea(partida)
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}

/**
 * 
 * @param {Partida} partida
 * @returns {Discord.Role} 
 */
async function getRolByName(partida, rolName) {
    var roleManager = await partida.channel.guild.roles.fetch()
    for (let [key, value] of roleManager) {
        if (value.name == rolName) {
            return value
        }
    }
}
/**
 * 
 * @returns {Date}
 */
async function getDateLater() {
    var date = new Date()
    date.setMinutes(date.getMinutes() + 30)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
}

/**
 * 
 * @param {Partida} partida 
 */
async function repartirPuntos(partida) {
    var { gladiador1, gladiador2, eventosRandom } = partida
    var memberManager = await partida.channel.guild.members.fetch()
    var rolAdmin = getRolByName(partida, "El Admin")
    switch (eventosRandom) {
        case 0:
        case 1:
            var ganador = memberManager.get((gladiador1.vida > 0 ? gladiador1.id : gladiador2.id))
            var perdedor = memberManager.get((gladiador1.vida > 0 ? gladiador2.id : gladiador1.id))
            if (ganador.user.bot == false && perdedor.user.bot == false) {
                await profileModel.findOneAndUpdate({
                    userID: ganador.id,
                    serverID: partida.guildId
                }, {
                    $inc: {
                        udyrcoins: 100
                    }
                })
                await profileModel.findOneAndUpdate({
                    userID: perdedor.id,
                    serverID: partida.guildId
                }, {
                    $inc: {
                        udyrcoins: -100
                    }
                })
            }
            if (perdedor.roles.cache.get(rolAdmin.id)) {
                if (eventosRandom == 0) {
                    partida.channel.send(`<@${ganador.id}> le ha dado una paliza a <@${perdedor.id}>, le ha robado 100<:udyrcoin:961729720104419408> y ademas ahora es el nuevo admin`)
                }
                else if (eventosRandom == 1) {
                    partida.channel.send(`<@${ganador.id}> le ha robado 100<:udyrcoin:961729720104419408> a <@${perdedor.id}> y ademas ahora es el nuevo admin`)
                }
                ganador.roles.add(rolAdmin)
                perdedor.roles.remove(rolAdmin)
                adminActual.id = ganador.id
                adminActual.dateLimite = getDateLater()
                await adminModel.findOneAndUpdate({
                    serverID: partida.guildId
                }, {
                    $set: {
                        userID: ganador.id,
                        endDate: getDateLater()
                    }
                })
            } else {
                banquillo.push(perdedor.id)
                setTimeout((perdedorID) => {
                    for (let i = 0; i < banquillo.length; i++) {
                        if (banquillo[i] == perdedorID) {
                            banquillo.splice(i, 1)
                        }
                    }
                }, 30 * 60 * 1000, perdedor.id);
            }
            break;
        case 2:
            if (partida.tituloEnJuego) {
                memberManager.get(gladiador1.id).roles.remove(rolAdmin)
                memberManager.get(gladiador2.id).roles.remove(rolAdmin)
                memberManager.get(UDYRID).roles.add(rolAdmin)
                partida.channel.send(`El título de admin vuelve al único que es digno en este server.`)
                adminActual.id = ganador.id
                adminActual.dateLimite = getDateLater()
                await adminModel.findOneAndUpdate({
                    serverID: partida.guildId
                }, {
                    $set: {
                        userID: ganador.id,
                        endDate: getDateLater()
                    }
                })
            }
            break;
        case 3:
            var rolMaricon = getRolByName(partida, "Maricones")
            memberManager.get(gladiador1.id).roles.add(rolMaricon)
            memberManager.get(gladiador2.id).roles.add(rolMaricon)
            setTimeout((gladiador1, gladiador2, memberManager) => {
                memberManager.get(gladiador1.id).roles.remove(rolMaricon)
                memberManager.get(gladiador2.id).roles.remove(rolMaricon)
            }, 4 * 60 * 60 * 1000, gladiador1, gladiador2, memberManager);
            if (partida.tituloEnJuego) {
                memberManager.get(gladiador1.id).roles.remove(rolAdmin)
                memberManager.get(gladiador2.id).roles.remove(rolAdmin)
                memberManager.get(UDYRID).roles.add(rolAdmin)
                partida.channel.send(`El título de admin vuelve al único que es digno en este server.`)
                adminActual.id = ganador.id
                adminActual.dateLimite = getDateLater()
                await adminModel.findOneAndUpdate({
                    serverID: partida.guildId
                }, {
                    $set: {
                        userID: ganador.id,
                        endDate: getDateLater()
                    }
                })
            }
            break;
    }
}

/**
 * 
 * @param {Partida} partida 
 */
async function leerRondasPelea(partida) {
    if (partida.logCombate.length == 2) {
        partida.channel.send(partida.logCombate[0] + "\n" + partida.logCombate[1])
        partida.logCombate.splice(0, 2)
        if (partida.tituloEnJuego) {
            await repartirPuntos(partida)
        }
        combates.delete(partida.guildId)
        return
    }
    partida.channel.send(partida.logCombate[0])
    partida.logCombate.splice(0, 1)
    setTimeout((partida) => {
        leerRondasPelea(partida)
    }, 5000, partida);
}

/**
 * 
 * @param {Partida} partida 
 * @param {number} turno
 */
function combate(partida, turno) {
    var { gladiador1, gladiador2 } = partida
    var logCombateText = `**Turno ${turno}:**\n`;
    /**
     * CRITICO 12% ADMIN --------- 10% PIBE NORMAL
     * 
     * PARRY 20% ADMIN ----------- 17% PIBE NORMAL
     * 
     * ESCUDO 12% ADMIN ---------- 10% PIBE NORMAL
     * 
     */
    var critico = Math.floor(Math.random() * 100) + 1
    var parry = Math.floor(Math.random() * 100) + 1
    var escudo = Math.floor(Math.random() * 100) + 1
    if (gladiador1.nombre == adminActual.nombre) {
        critico = critico <= 12
        parry = parry <= 17
        escudo = escudo <= 10
    } else {
        critico = critico <= 10
        parry = parry <= 20
        escudo = escudo <= 12
    }
    //var eventoImprobable = Math.floor(Math.random() * 100) == 23;
    var eventoImprobable = Math.floor(Math.random() * 2) == 0;
    if (!eventoImprobable) {
        if (parry) {
            var stun = Math.floor(Math.random() * 7) == 0;
            if (stun) {
                if (critico) {
                    logCombateText += `:ninja: ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra hacerle parry al ataque **cr\u00EDtico** y le stunea durante 1 turno. :ninja:\n`;
                }
                else {
                    logCombateText += `:ninja: ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra hacerle parry y le stunea durante 1 turno. :ninja:\n`;
                }
                logCombateText += gladiador2.nombre + ": <:sonrisa:801799866212417606>\n";
                logCombateText += gladiador1.nombre + ": <:6061_unsettledtom:602529346711846933>\n";
                let hostia = Math.floor(Math.random() * 21) + 20;
                logCombateText += `:crossed_swords: ${gladiador2.nombre} golpea a ${gladiador1.nombre} infligiendole ${hostia} puntos de da\u00F1o. :crossed_swords:\n`;
                gladiador1.vida -= hostia;
            }
            else {
                if (critico) {
                    logCombateText += `:ninja: ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra hacerle parry al ataque **cr\u00EDtico** y le hace 15 puntos de da\u00F1o. :ninja:\n`;
                } else {
                    logCombateText += `:ninja: ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra hacerle parry y le hace 15 puntos de da\u00F1o. :ninja:\n`;
                }
                gladiador1.vida -= 15;
            }
        } else if (escudo) {
            if (critico) {
                logCombateText += `:shield: ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra esquivar el ataque **cr\u00EDtico**. :shield:\n`;
            } else {
                logCombateText += `:shield: ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra esquivar el ataque. :shield:\n`;
            }
            if (gladiador2.vida < 100) {
                logCombateText += `:heart: ${gladiador2.nombre} se toma una poti a su salud y recupera ${Math.floor((100 - gladiador2.vida) * 50 / 100)} puntos de salud. :heart:\n`;
                gladiador2.vida += Math.floor((100 - gladiador2.vida) * 50 / 100);
            }
        } else if (critico) {
            var hostiaCritico = Math.floor(Math.random() * 21) + 60;
            logCombateText += `:boom: ${gladiador1.nombre} golpea y le causa un da\u00F1o tremendo a ${gladiador2.nombre} infligiendole ${hostiaCritico} puntos de da\u00F1o. :boom:\n`;
            logCombateText += gladiador1.nombre + ": <:maestria7:761734001190109194>\n";
            gladiador2.vida -= hostiaCritico;
        }
        else {
            let hostia = Math.floor(Math.random() * 21) + 20;
            logCombateText += `:crossed_swords: ${gladiador1.nombre} golpea a ${gladiador2.nombre} infligiendole ${hostia} puntos de da\u00F1o.:crossed_swords:\n`;
            gladiador2.vida -= hostia;
        }
        gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
        gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
        logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
        partida.logCombate.push(logCombateText);
    } else {
        let evento = eventosRandom[Math.floor(Math.random() * eventosRandom.length)];
        partida.eventosRandom = evento + 1
        switch (evento) {
            case eventosRandom[0]:
                logCombateText += `🤘😔 ${gladiador1.nombre} se da cuenta de que vive en un mundo virtual, ante tal hecho decide que lo mejor es suicidarse. 🤘😔\n`;
                gladiador1.vida -= gladiador1.vida;
                gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
                gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
                logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
                partida.logCombate.push(logCombateText);
                partida.logCombate.push(`🏆 \u00A1El ganador del combate es <@${gladiador2.id}>! 🏆`);
                break;
            case eventosRandom[1]:
                logCombateText += `🐻 Aparece <@${UDYRID}> y gankea por sorpresa a ${gladiador1.nombre} y a ${gladiador2.nombre}. 🐻\n`;
                gladiador1.vida = 0;
                gladiador2.vida = 0;
                gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
                gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
                logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
                partida.logCombate.push(logCombateText);
                partida.logCombate.push(`🏆 \u00A1El ganador del combate es <@${UDYRID}>! 🏆`);
                break;
            case eventosRandom[2]:
                logCombateText += "🥰 De tanto darse de hostias se dan cuenta de que estan hechos el uno para el otro y abandonan el combate. 🥰\n";
                gladiador1.vida = 0;
                gladiador2.vida = 0;
                gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
                gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
                logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n ${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
                partida.logCombate.push(logCombateText);
                partida.logCombate.push("🏆 \u00A1El ganador del combate es el amor! 🏆");
                break;
        }
    }
    if (gladiador1.vida > 0 && gladiador2.vida > 0) {
        var gladiadoraux = partida.gladiador1
        partida.gladiador1 = partida.gladiador2
        partida.gladiador2 = gladiadoraux
        combate(partida, turno + 1);
    } else if (eventoImprobable == false) {
        partida.logCombate.push(`🏆 \u00A1El ganador del combate es <@${gladiador1.vida > 0 ? gladiador1.id : gladiador2.id}>! 🏆`);
    }
}