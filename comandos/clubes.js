const Discord = require("discord.js")
const { Message, Client } = require("discord.js")
module.exports = {
    name: 'clubes',
    aliases: [],
    description: 'Funcion para que te diga que posición para clubes.',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {Discord} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        if (!message.member || !message.member.voice) return;
        var members = message.member.voice.channel.members;
        var posiciones = ["DC", "DC", "MD", "MI", "MC", "MC", "LI", "LD", "DFC", "DFC", "POR"]
        var posicionesShuffled = shuffle(posiciones)
        var mensaje = ""
        for (let [id, member] of members) {
            mensaje += `<@${member.id}> - ${posicionesShuffled.splice(0, 1)}\n`
        }
        message.channel.send(mensaje)
    }
}

/**
 * 
 * @param {string[]} array 
 * @returns {string[]}
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
