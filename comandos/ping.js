const { Message } = require("discord.js")

module.exports = {
    name: 'ping',
    description: "Mi propio commando ping",
    /**
     * 
     * @param {Message} message
     * @param {string[]} args
     */
    execute(message, args, cmd, client, Discord, profileData) {       
        message.channel.send(`🏓 Hay una latencia de ${Date.now()-message.createdTimestamp} ms`);
    }
}

