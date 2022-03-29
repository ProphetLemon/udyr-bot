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

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
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
            return
            var equiposDeseados = [
                [tipo[0], tipo[0], tipo[1], tipo[2], tipo[3]],
                [tipo[0], tipo[1], tipo[1], tipo[2], tipo[3]],
                [tipo[0], tipo[1], tipo[2], tipo[2], tipo[3]],
                [tipo[0], tipo[1], tipo[2], tipo[3], tipo[3]]
            ]
            var equipo = equiposDeseados[Math.floor(Math.random() * equiposDeseados.length)]
            var miembros = message.member.voice.channel.members.array()
            let shuffled = equiposDeseados
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        } else {
            var agenteTipo = []
            for (let i = 0; i < agentes.length; i++) {
                if (agentes[i].tipo.toLowerCase() == cmd) {
                    agenteTipo.push(agentes[i])
                }
            }
            var agenteRandom = agenteTipo[Math.floor(Math.random() * agenteTipo.length)]
            message.channel.send(`Te toca jugar ${agenteRandom.nombre}`)
        }
    }
}
const tipo = ["CONTROLADOR", "DUELISTA", "INICIADOR", "CENTINELA"]
const agentes = [new agente("Astra", tipo[0]),
new agente("Brimstone :dash:", tipo[0]),
new agente("Omen :ghost:", tipo[0]),
new agente("Viper :skull_crossbones:", tipo[0]),
new agente("Jett :dagger:", tipo[1]),
new agente("Neon :sparkles:", tipo[1]),
new agente("Phoenix :fire:", tipo[1]),
new agente("Raze :bomb:", tipo[1]),
new agente("Reyna :gun::princess:", tipo[1]),
new agente("Yoru :japanese_ogre:", tipo[1]),
new agente("Breach :house_abandoned:", tipo[2]),
new agente("KAY/O :robot:", tipo[2]),
new agente("Skye :wolf:", tipo[2]),
new agente("Sova :bow_and_arrow:", tipo[2]),
new agente("Chamber :nerd:", tipo[3]),
new agente("Cypher :cowboy:", tipo[3]),
new agente("Killjoy :woman_mechanic:", tipo[3]),
new agente("Sage :ice_cube:", tipo[3]),
]