const { Message, Client, AttachmentBuilder } = require('discord.js');
const { Canvacord } = require("canvacord");

module.exports = {
    name: 'efectos',
    aliases: ['trigger', 'ohno', 'rip', 'phub', 'joke', 'pornhub', 'affect', 'opinion', 'kiss', 'beautiful', 'slap', 'memes'],
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
        return;
        return;
        console.log(`INICIO ${cmd.toUpperCase()}`)
        var mensajeABorrar
        message.channel.send("Generando imagen...").then(msg => {
            mensajeABorrar = msg
        })
        var md = message.guild == undefined
        var target = message.mentions.users.first() ? message.mentions.users.first() : message.author
        var texto = ""
        if (args.length >= 1) {
            if (target.id != message.author.id) {
                args.splice(0, 1)
            }
            texto = args.join(" ")
        }
        if (cmd == "efectos" || cmd == "memes") {
            var mensaje = ""
            var efectos = this.aliases
            for (let i = 0; i < efectos.length; i++) {
                mensaje += `${i + 1}.- ${efectos[i]}\n`
            }
            message.channel.send(mensaje)
        }
        if (cmd == "trigger") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.trigger(avatar);
            let attachment = new AttachmentBuilder(image);
            attachment.setName("triggered.gif")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "ohno") {
            if (texto == "") {
                return message.reply("Tienes que poner un mensaje para el meme")
            }
            let image = await Canvacord.ohno(texto);
            let attachment = new AttachmentBuilder(image);
            attachment.setName("ohno.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "rip") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.rip(avatar);
            let attachment = new AttachmentBuilder(image);
            attachment.setName("rip.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "phub" || cmd == "pornhub") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            if (texto == "") {
                return message.reply("Tienes que poner un mensaje para el meme")
            }
            let image = await Canvacord.phub({ username: target.username, image: avatar, message: texto });
            let attachment = new AttachmentBuilder(image);
            attachment.setName("phub.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "joke") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.jokeOverHead(avatar)
            let attachment = new AttachmentBuilder(image);
            attachment.setName("joke.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "affect") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.affect(avatar)
            let attachment = new AttachmentBuilder(image);
            attachment.setName("affect.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "opinion") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            if (texto == "") {
                return message.reply("Tienes que poner un mensaje para el meme")
            }
            let image = await Canvacord.opinion(avatar, texto)
            let attachment = new AttachmentBuilder(image);
            attachment.setName("opinion.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "kiss") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            let avatar2 = (message.mentions.users.size == 2 ? message.mentions.users.get(message.mentions.users.keyAt(1)) : message.author).displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.kiss(avatar2, avatar)
            let attachment = new AttachmentBuilder(image);
            attachment.setName("kiss.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "beautiful") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.beautiful(avatar)
            let attachment = new AttachmentBuilder(image);
            attachment.setName("beautiful.png")
            message.channel.send({ files: [attachment] })
        }
        if (cmd == "slap") {
            let avatar = target.displayAvatarURL({ dynamic: false, format: 'png' });
            let avatar2 = (message.mentions.users.size == 2 ? message.mentions.users.get(message.mentions.users.keyAt(1)) : message.author).displayAvatarURL({ dynamic: false, format: 'png' });
            let image = await Canvacord.slap(avatar2, avatar)
            let attachment = new AttachmentBuilder(image);
            attachment.setName("slap.png")
            message.channel.send({ files: [attachment] })
        }
        if (!md) {
            message.delete()
        }
        mensajeABorrar.delete()
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}