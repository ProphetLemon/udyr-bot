const { Client, GuildMember } = require("discord.js")
/**
 * 
 * @param {*} Discord 
 * @param {Client} client 
 * @param {GuildMember} member
 */
module.exports = (Discord, client, member) => {
    if (!member.user.bot && member.guild.id == "598896817157046281") {
        const channel = client.channels.cache.get("598896817161240663")
        channel.send(`Ha llegado un nuevo maric\u00F3 al servidor, <@${member.id}>`)
    }
}