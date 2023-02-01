const { Message } = require("discord.js");
const fs = require('fs');
module.exports = {
    name: 'simp',
    aliases: [],
    description: 'Simp de Aida',
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
        message.channel.send({ files: ['./images/simp.jpg'] }).then(msg => {
            setTimeout(() => {
                message.delete()
                msg.delete()
            }, 5000);
        })
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}