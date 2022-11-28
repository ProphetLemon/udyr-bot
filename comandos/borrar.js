const { Message } = require("discord.js");
var profileModel = require("../models/profileSchema");
module.exports = {
    name: 'borrar',
    aliases: [],
    description: 'Funcion para borrar a alguien de la bbdd',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     * @returns 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        return;
        console.log("INICIO BORRAR");
        var roleManager = await message.guild.roles.fetch()
        var rolAdmin = roleManager.get("855758139140079646")
        if (!message.member.roles.cache.has(rolAdmin.id)) return message.reply("para usar este comando debes ser admin, maric\u00F3n");
        var targetData = message.mentions.users.first();
        if (!targetData) {
            console.log("FIN BORRAR");
            return message.reply("mucho admin pero no sabes ni mencionar a alguien, maric\u00F3n");
        }
        var existe = await profileModel.findOne({
            userID: targetData.id,
            serverID: message.guild.id
        });
        if (!existe) {
            console.log("FIN BORRAR");
            return message.reply("como esperas que borre a alguien que ni siquiera habla en el server, maric\u00F3n")
        };
        await profileModel.findOneAndRemove({
            userID: targetData.id,
            serverID: message.guild.id
        });
        message.channel.send("Se ha borrado correctamente el usuario!").then(msg => {
            setTimeout(() => {
                msg.delete()
            }, 5000);
            message.delete()
        })
        console.log("FIN BORRAR");
    }
}