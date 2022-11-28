module.exports = {
    name: 'spam',
    aliases: [],
    description: 'Funcion para hacer spam',
    execute(message, args, cmd, client, Discord, profileData) {
        return;
        return;
        console.log(`INICIO ${cmd.toUpperCase()}`)
        message.delete();
        if ((!args[0] || args[0].trim() == "" || !args[0].startsWith("https://www.twitch.tv/")) && message.author.id != "202065665597636609") {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return metodosUtiles.insultar(message);
        }
        console.log(`FIN ${cmd.toUpperCase()}`)
        return message.channel.send(`GENTE @everyone\n\n${message.member.displayName.toUpperCase()} ESTA EN PUTO DIRECTO\n\n` +
            `GO GO GO GO\n\n${message.author.id == "202065665597636609" ? "https://www.twitch.tv/profetalimon" : args[0]}`);

    }
}