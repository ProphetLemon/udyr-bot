const { Message, Client } = require('discord.js');
const impuestoModel = require('../models/impuestoSchema')
module.exports = {
    name: 'impuestos',
    aliases: ['arca', 'arcas'],
    description: 'Funcion ver los impuestos recolectados',
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
        var serverDinero = await impuestoModel.findOne({
            serverID: message.guild.id
        })
        var dinero = 0
        if (serverDinero) {
            dinero = serverDinero.udyrcoins
        }
        message.channel.send(`El servidor '${message.guild.name}' tiene ${dinero} <:udyrcoin:825031865395445760>`).then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 6000);
        })
    }
}