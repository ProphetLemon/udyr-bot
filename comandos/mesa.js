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
            message.reply("debes de estar en un chat de voz")
            console.log(`FIN ${cmd.toUpperCase()}`);
            return;
        }
        message.channel.send(`Empieza a jugar ${channel.members.array()[Math.floor(Math.random() * channel.members.size)].displayName}`)
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}