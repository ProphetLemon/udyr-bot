const { Message } = require('discord.js');
const channelModel = require('../models/channelSchema');
module.exports = {
    name: 'setup',
    aliases: ['install', 'instalar'],
    description: 'Funcion para crear los roles del servidor y añadir canales de texto para que funcione el bot',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO SETUP")
        let channelData = await channelModel.findOne({
            channelID: message.channel.id,
            serverID: message.guild.id
        })
        if (!channelData) {
            let channel = await channelModel.create({
                channelID: message.channel.id,
                serverID: message.guild.id
            });
            channel.save();
        }
        var guildRoles = await message.guild.roles.fetch();
        var roleAdmin = guildRoles.cache.find(role => role.name == "El Admin");
        if (!roleAdmin) {
            guildRoles.create({
                data: {
                    name: "El Admin",
                    color: 'YELLOW',
                    position: 1
                },
                reason: "Rol creado por Udyr"
            });
        }
        var roleMaricones = guildRoles.cache.find(role => role.name == "Maricones");
        if (!roleMaricones) {
            guildRoles.create({
                data: {
                    name: "Maricones",
                    color: 'DARK_PURPLE',
                    position: 2
                },
                reason: "Rol creado por Udyr"
            });
        }
        console.log("FIN SETUP");
    }
}