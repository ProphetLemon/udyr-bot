const { Message, Discord } = require("discord.js");

module.exports = {
    name: 'encuesta',
    aliases: ['poll'],
    description: 'Funcion que sirve para crear encuestas',
    /**
     * @param {Message} message
     * @param {string []}args
     * @param {Discord} Discord
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`);
        var memberManager = await message.guild.members.fetch();
        var newEmbed = new Discord.MessageEmbed()
            .setColor("#B17428")
            .setFooter(`Encuesta hecha por ${message.member.displayName}`, message.author.avatarURL())
            .setTitle(`${args.join(" ").toUpperCase()}`)
        var messagePoll = await message.channel.send(newEmbed);
        messagePoll.react('👍')
        messagePoll.react('👎')
        message.delete({ timeout: 500 });
        const filter = (reaction) => reaction.emoji.name == '👍' || reaction.emoji.name == '👎';
        const collector = messagePoll.createReactionCollector(filter, { time: 30000 });
        collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
        collector.on('end', collected => {
            var votosSI = "", votosNO = ""

            for (var [key, value] of collected.get('👍').users.cache) {
                if (key == "849997112930074654") continue;
                votosSI += `\n${memberManager.find(member => member.id == key).displayName}`;
            }
            for (var [key, value] of collected.get('👎').users.cache) {
                if (key == "849997112930074654") continue;
                votosNO += `\n${memberManager.find(member => member.id == key).displayName}`;
            }
            newEmbed = new Discord.MessageEmbed()
                .setColor("#B17428")
                .setTitle(`Fin de la encuesta *${args.join(" ").toUpperCase()}*`)
                .addFields(
                    { name: `VOTOS 👍 (${collected.get('👍').users.cache.size - 1})`, value: votosSI == "" ? "\u200B" : votosSI, inline: true },
                    { name: `VOTOS 👎 (${collected.get('👎').users.cache.size - 1})`, value: votosNO == "" ? "\u200B" : votosNO, inline: true }
                )
            message.channel.send(newEmbed)
        });
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}