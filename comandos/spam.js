module.exports = {
    name: 'spam',
    aliases: ['apuesta', 'cerrar'],
    description: 'Funcion para crear apuestas o apostar en ellas',
    execute(message, args, cmd, client, Discord, profileData) {
        message.delete()
        if ((!args[0] ||args[0].trim()=="") && message.author.id !="202065665597636609") return metodosUtiles.insultar(message);
        return message.channel.send(`GENTE\n\n${message.member.displayName.toUpperCase()} ESTA EN PUTO DIRECTO\n\n`+
        `GO GO GO GO\n\n${message.author.id =="202065665597636609"?"https://www.twitch.tv/profetalimon":args[0]}`);
    }
}