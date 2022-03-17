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
        var rolAdmin = message.member.roles.cache.get("855758798014119966");
        if (!rolAdmin) {
            console.log("FIN MARICON");
            return metodosUtiles.insultar(message)
        };
        var guildMember = await message.guild.members.fetch();
        guildMember.forEach(member => {
            var rol = member.roles.cache.get("821415220483326012");
            if (rol) {
                member.roles.remove(rol);
            }
        });
        console.log("FIN MARICON");
    }
}