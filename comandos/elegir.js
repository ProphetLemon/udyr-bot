const { Message } = require("discord.js");
module.exports = {
    name: 'elegir',
    aliases: [],
    description: 'Funcion que elige entre varias opciones',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        return;
        return;
        let opciones = message.content.split("\"")
        opciones.splice(0, 1);
        for (let i = 0; i < opciones.length; i++) {
            if (opciones[i].trim() == "") {
                opciones.splice(i--, 1)
            }
        }
        if (opciones.length == 0) return message.channel.send("No has puesto ninguna opci\u00F3n")
        if (opciones.length == 1) return message.channel.send("Solo has puesto una opci\u00F3n")
        var tiradas = (opciones.length * 2) + 1
        var cont = 0
        do {
            cont = cont + 1
            var resultados = new Map()
            for (let i = 0; i < tiradas; i++) {
                var resultado = opciones[metodosUtiles.getRandom(opciones.length - 1)]
                var concurrencias = resultados.get(resultado)
                if (concurrencias) {
                    resultados.set(resultado, concurrencias + 1)
                } else {
                    resultados.set(resultado, 1)
                }
            }
            const max = Math.max(...resultados.values());
            var finalistas = getByValue(resultados, max)
        } while (finalistas.length != 1)
        message.channel.send(`Despues de ${tiradas * cont} tiradas ha salido vencedor:\n**${finalistas[0].toUpperCase()}**`)
    }
}
/**
 * 
 * @param {Map} map 
 * @param {number} searchValue 
 * @returns 
 */
function getByValue(map, searchValue) {
    var resultados = []
    for (let [key, value] of map.entries()) {
        if (value === searchValue)
            resultados.push(key)
    }
    return resultados
}
