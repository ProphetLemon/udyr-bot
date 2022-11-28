const { Message, Client } = require("discord.js")
module.exports = {
    name: 'anunciar',
    aliases: ['announce'],
    description: 'Funcion para anunciar cosas',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (message.member.id != "202065665597636609") {
            return message.reply("Bro callate medio mes").then(msg => {
                setTimeout(() => {
                    message.delete()
                    msg.delete()
                }, 5000);
            })
        }
        message.channel.send(args.join(" "))
        message.delete()
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}