const { Message } = require("discord.js")

module.exports = {
    name: 'ping',
    description: "Mi propio commando ping",
    /**
     * 
     * @param {Message} message
     * @param {string[]} args
     */
    execute(client, message, args,cmd) {       
        message.channel.send(`🏓 Hay una latencia de ${Date.now()-message.createdTimestamp} ms`);
    }
}

