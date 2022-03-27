const profileModel = require('../models/profileSchema');

const { Message } = require('discord.js');
module.exports = {
    name: 'descripcion',
    aliases: ['desc'],
    description: 'Funcion para modificar la descripcion de tu perfil',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (!profileData) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("No tas inscrito en la Liga Udyr, maric\u00F3n. Haz un 'udyr puntos' antes")
        }
        var descripcion = args.join(" ")
        await profileModel.findOneAndUpdate({
            userID: profileData.userID,
            serverID: profileData.serverID
        }, {
            $set: {
                descripcion: descripcion
            }
        })
        message.channel.send("Se ha modificado correctamente tu descripcion!").then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 5000);
        })
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}