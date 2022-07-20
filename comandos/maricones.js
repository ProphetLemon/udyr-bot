const { Message, Role } = require("discord.js");

module.exports = {
    name: 'maricones',
    aliases: ['maricon'],
    description: 'Funcion para quitar el rol de maricones',
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
        console.log("INICIO MARICON");
        var memberManager = await message.guild.members.fetch()
        var rolMaricon = getRolMaricon(message)
        var messageLater = await message.channel.send("Borrando...")
        message.delete()
        for (let [key, value] of memberManager) {
            if (value.roles.cache.get(rolMaricon.id)) {
                value.roles.remove(rolMaricon)
            }
        }
        messageLater.delete()
        console.log("FIN MARICON");
    }
}

/**
 * 
 * @param {Message} message 
 * @return {Role|undefined}
 */
async function getRolMaricon(message) {
    var rolManager = await message.guild.roles.fetch()
    for (let [key, value] of rolManager) {
        if (value.name == "Maricones") {
            return value
        }
    }
    return null
}