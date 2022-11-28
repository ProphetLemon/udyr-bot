const { Message, Client } = require('discord.js');
const impuestoModel = require('../models/impuestoSchema')
module.exports = {
    name: 'impuestos',
    aliases: ['arca', 'arcas', 'banca', 'impuesto'],
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
        return;
        return;
        console.log(`INICIO ${cmd.toUpperCase()}`)
        var serverDinero = await impuestoModel.findOne({
            serverID: message.guild.id
        })
        var dinero = 0
        if (serverDinero) {
            dinero = serverDinero.udyrcoins
        }
        message.channel.send(`El servidor '${message.guild.name}' tiene ${metodosUtiles.numberWithCommas(dinero)} <:udyrcoin:961729720104419408>`).then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 6000);
        })
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}