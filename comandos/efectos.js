const { Message, Client, MessageAttachment } = require('discord.js');
const { Canvacord } = require("canvacord");

module.exports = {
    name: 'efectos',
    aliases: ['trigger', 'ohno', 'rip', 'phub', 'joke', 'pornhub', 'affect', 'opinion', 'kiss', 'beautiful', 'slap'],
    description: 'Funcion ver el raking de puntos',
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
        console.log(`INICIO ${cmd.toUpperCase()}`)
        var md = message.guild == undefined
        var target = !md && message.mentions.members.first() ? message.mentions.members.first() : message.member
        var texto = ""
        if (args.length > 1) {
            if (target.id != message.member.id) {
                args.splice(0, 1)
            }
            texto = args.join(" ")
        }
        if (cmd == "efectos") {
            var mensaje = ""
            var efectos = this.aliases
            for (let i = 0; i < efectos.length; i++) {
                mensaje += `${i + 1}.- ${efectos[i]}\n`
            }
            message.channel.send(mensaje)
        }
        if (cmd == "trigger") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.trigger(avatar);
            let attachment = new MessageAttachment(image, "triggered.gif");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "ohno") {
            if (texto == "") {
                return message.reply("Tienes que poner un mensaje para el meme")
            }
            let image = await Canvacord.ohno(texto);
            let attachment = new MessageAttachment(image, "ohno.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "rip") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.rip(avatar);
            let attachment = new MessageAttachment(image, "rip.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "phub" || cmd == "pornhub") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            if (texto == "") {
                return message.reply("Tienes que poner un mensaje para el meme")
            }
            let image = await Canvacord.phub({ username: target.displayName, image: avatar, message: texto });
            let attachment = new MessageAttachment(image, "phub.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "joke") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.jokeOverHead(avatar)
            let attachment = new MessageAttachment(image, "joke.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "affect") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.affect(avatar)
            let attachment = new MessageAttachment(image, "affect.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "opinion") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            if (texto == "") {
                return message.reply("Tienes que poner un mensaje para el meme")
            }
            let image = await Canvacord.opinion(avatar, texto)
            let attachment = new MessageAttachment(image, "opinion.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "kiss") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            let avatar2 = (!md && message.mentions.members.size == 2 ? message.mentions.members.get(message.mentions.members.keyAt(1)).user : message.author).displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.kiss(avatar2, avatar)
            let attachment = new MessageAttachment(image, "kiss.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "beautiful") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.beautiful(avatar)
            let attachment = new MessageAttachment(image, "beautiful.png");
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "slap") {
            let avatar = target.user.displayAvatarURL({ dynamic: false, format: 'png' });
            let avatar2 = (!md && message.mentions.members.size == 2 ? message.mentions.members.get(message.mentions.members.keyAt(1)).user : message.author).displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.slap(avatar2, avatar)
            let attachment = new MessageAttachment(image, "slap.png");
            message.channel.send({ files: [attachment] })
        }
        message.delete()
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}