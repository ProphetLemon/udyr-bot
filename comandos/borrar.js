var profileModel = require("../models/profileSchema");
module.exports = {
    name: 'borrar',
    aliases: [],
    description: 'Funcion para borrar a alguien de la bbdd',
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`);
        if (!message.member.roles.cache.get("598897304812126208")) return message.reply("para usar este comando debes ser admin, maric\u00F3n");
        var targetData = message.mentions.users.first();
        if (!targetData) {
            console.log(`FIN ${cmd.toUpperCase()}`);
            return message.reply("mucho admin pero no sabes ni mencionar a alguien, maric\u00F3n");
        }
        var existe = await profileModel.findOne({ userID: targetData.id });
        if (!existe) {
            console.log(`FIN ${cmd.toUpperCase()}`);
            return message.reply("como esperas que borre a alguien que ni siquiera habla en el server, maric\u00F3n")
        };
        await profileModel.findOneAndRemove({
            userID: targetData.id
        });
        var guildMembers = await message.guild.members.fetch();
        var usuarioBorrado = guildMembers.find(member => member.id == targetData.id);
        message.channel.send(`Se ha borrado correctamente al usuario ${usuarioBorrado.displayName}`).then(msg => {
            msg.delete({ timeout: 3000 })
            message.delete();
        });
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}