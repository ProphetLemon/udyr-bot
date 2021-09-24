const { Message } = require("discord.js");

module.exports = {
    name: 'mesa',
    aliases: [],
    description: 'Funcion para crear elegir a un jugador que esté en el chat de voz',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`);
        let channel = message.member.voice.channel
        if (!channel) {
            message.reply("maric\u00F3n entra al chat de voz")
            console.log(`FIN ${cmd.toUpperCase()}`);
            return;
        }
        do {
            var member = channel.members.array()[Math.floor(Math.random() * channel.members.size)]
        } while (member.user.bot)
        message.channel.send(`Le toca al maric\u00F3n de ${member.displayName}`)
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}