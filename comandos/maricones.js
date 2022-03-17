const { Message } = require("discord.js");

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
        var roles = await message.guild.roles.fetch()
        var rolAdmin = roles.cache.find(role => role.name == "Tontitos Supremos")
        if (!rolAdmin) {
            console.log("FIN MARICON");
            return metodosUtiles.insultar(message)
        };
        var guildMember = await message.guild.members.fetch();
        var mariconRol = roles.cache.find(role => role.name == "Maricones")
        guildMember.forEach(member => {
            member.roles.remove(mariconRol.id)
        });
        console.log("FIN MARICON");
    }
}