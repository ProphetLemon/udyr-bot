const { Message, Client } = require('discord.js');
const profileModel = require('../models/profileSchema');
const math = require('mathjs');
module.exports = {
    name: 'desviacion',
    aliases: ['sd', 'consulta'],
    description: 'Funcion que te dice a cuantos se va robar',
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
        var personas = await profileModel.find({
            serverID: message.guild.id
        });
        personas.sort(function (a, b) {
            return b.udyrcoins - a.udyrcoins;
        });
        var i = 6
        do {
            i = i - 1
            var dineros = []
            personas = personas.slice(0, i)
            for (let i = 0; i < personas.length; i++) {
                dineros.push(personas[i].udyrcoins)
            }
            var sd = math.std(dineros)
        } while (sd > 200 && personas.length > 1)
        if (personas.length > 1) {
            message.channel.send(`Se va a robar a los ${personas.length} primeros`)
        } else {
            message.channel.send(`Vigila tu cartera <@!${personas[0].userID}>`)
        }
    }
}