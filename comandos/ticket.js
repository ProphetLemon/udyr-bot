const { Message, Client, Permissions, GuildMemberManager } = require("discord.js")
module.exports = {
    name: 'ticket',
    aliases: [],
    description: 'Funcion para crear tickets',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        return;
        return;
        console.log(`INICIO ${cmd.toUpperCase()}`)
        const channel = await message.guild.channels.create(`ticket: ${message.author.tag}`, {
            type: 'GUILD_TEXT',
            parent: "968447644655550464",
            permissionOverwrites: [
                {
                    id: message.guild.roles.everyone,
                    deny: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: message.author.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                }
            ]
        })
        const reactionMessage = await channel.send('Gracias por contactar con nosotros!')
        try {
            await reactionMessage.react("🔒")
            await reactionMessage.react("⛔")
        } catch (err) {
            channel.send("Ha habido un error mandando los emojis")
        }
        const filter = (reaction, user) => (reaction.emoji.name === '🔒' || reaction.emoji.name === '⛔') && message.guild.members.cache.get(user.id).permissions.has("ADMINISTRATOR") && !user.bot;
        const collector = reactionMessage.createReactionCollector({ filter, dispose: true });
        collector.on('collect', (reaction, user) => {
            switch (reaction.emoji.name) {
                case "🔒":
                    channel.permissionOverwrites.edit(message.author, { SEND_MESSAGES: false })
                    break;
                case "⛔":
                    channel.send('Se va a borrar el canal en 5 segundos!')
                    setTimeout(() => {
                        channel.delete()
                    }, 5000);
            }
        });
        message.channel.send(`Entra en en el canal de ${channel} para que podamos ayudarte`).then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 6000);
        });
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}