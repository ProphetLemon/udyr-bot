const { Message } = require("discord.js");

module.exports = {
    name: 'maricones',
    aliases: [],
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
   async execute(message,args,cmd,client,Discord,profileData) {
        var rolAdmin = message.member.roles.cache.get("598897304812126208");
        if (!rolAdmin) return metodosUtiles.insultar(message);
        var guildMember = await message.guild.members.fetch();
        guildMember.forEach(member => {
            var rol = member.roles.cache.get("821415220483326012");
            if (rol){
                member.roles.remove(rol);
            }
        });
    }
}