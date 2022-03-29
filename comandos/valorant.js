const { Message, Client } = require('discord.js');
class agente {
    /**
     * 
     * @param {string} nombre 
     * @param {string} tipo 
     */
    constructor(nombre, tipo) {
        this.nombre = nombre
        this.tipo = tipo
    }
}

/**
 * 
 * @param {string[]} array 
 * @returns 
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}
module.exports = {
    name: 'valorant',
    aliases: ['controlador', 'duelista', 'iniciador', 'centinela'],
    description: 'Funcion que te dice un agente en funcion de su tipo o alguien aleatorio',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        if (cmd == "valorant") {
            var equiposDeseados = [
                [tipo[0], tipo[0], tipo[1], tipo[2], tipo[3]],
                [tipo[0], tipo[1], tipo[1], tipo[2], tipo[3]],
                [tipo[0], tipo[1], tipo[2], tipo[2], tipo[3]],
                [tipo[0], tipo[1], tipo[2], tipo[3], tipo[3]]
            ]
            var equipo = equiposDeseados[Math.floor(Math.random() * equiposDeseados.length)]
            var channel = message.member.voice.channel
            if (channel == undefined) {
                message.channel.send("No estas en un canal de voz bro").then(msg => {
                    message.delete()
                    setTimeout(() => {
                        msg.delete()
                    }, 7000);
                })
                return
            }
            var miembros = channel.members.array()
            equipo = shuffleArray(equipo)
            var mensaje = ""
            for (let i = 0; i < miembros.length; i++) {
                var agenteTipo = []
                for (let i = 0; i < agentes.length; i++) {
                    if (agentes[i].tipo.toLowerCase() == cmd) {
                        agenteTipo.push(agentes[i])
                    }
                }
                do {
                    var agente = agenteTipo[Math.floor(Math.random() * agenteTipo.length)]
                } while (mensaje.split(agente.nombre).length == 2)
                mensaje += `${miembros[i].displayName} te toca jugar ${agente.nombre}\n`
            }
            message.channel.send(mensaje)
        } else {
            var agenteRandom = agenteTipo[Math.floor(Math.random() * agenteTipo.length)]
            message.channel.send(`Te toca jugar ${agenteRandom.nombre}`).then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 7000);
            })
        }
    }
}
const tipo = ["CONTROLADOR", "DUELISTA", "INICIADOR", "CENTINELA"]
const agentes = [
    new agente("Astra :milky_way:", tipo[0]),
    new agente("Brimstone :dash:", tipo[0]),
    new agente("Omen :ghost:", tipo[0]),
    new agente("Viper :snake:", tipo[0]),
    new agente("Jett :dagger:", tipo[1]),
    new agente("Neon :zap:", tipo[1]),
    new agente("Phoenix :fire:", tipo[1]),
    new agente("Raze :boom:", tipo[1]),
    new agente("Reyna :gun::princess:", tipo[1]),
    new agente("Yoru :japanese_ogre:", tipo[1]),
    new agente("Breach :house_abandoned:", tipo[2]),
    new agente("KAY/O :robot:", tipo[2]),
    new agente("Skye :wolf:", tipo[2]),
    new agente("Sova :bow_and_arrow:", tipo[2]),
    new agente("Chamber :nerd:", tipo[3]),
    new agente("Cypher :cowboy:", tipo[3]),
    new agente("Killjoy :wrench:", tipo[3]),
    new agente("Sage :ice_cube:", tipo[3]),
]