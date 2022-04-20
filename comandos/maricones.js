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
        var rolAdmin = roles.get("855758798014119966")
        if (!rolAdmin) {
            console.log("FIN MARICON");
            return metodosUtiles.insultar(message)
        };
        var guildMember = await message.guild.members.fetch();
        var mariconRol = roles.get("855758141906878486")
        guildMember.forEach(member => {
            member.roles.remove(mariconRol.id)
        });
        console.log("FIN MARICON");
    }
}