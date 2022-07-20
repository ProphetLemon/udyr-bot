const { Message, Client, Attachment, AttachmentBuilder } = require('discord.js');
const profileModel = require('../models/profileSchema');
const Canvas = require('canvas');
/**
 * 
 * @param {string} text 
 */
const ponerSaltosDeLinea = (text) => {
    var caracteres = text.split('')
    for (let i = 21; i < text.length; i += 22) {
        if (caracteres[i] == " ") {
            caracteres.splice(i, 1)
        }
        caracteres.splice(i, 0, "\n")
    }
    text = caracteres.join("")
    return text
};
module.exports = {
    name: 'perfil',
    //aliases: [],
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
        // Create a 700x250 pixel canvas and get its context
        // The context will be used to modify the canvas
        const canvas = Canvas.createCanvas(832, 1150);
        const context = canvas.getContext('2d');
        const target = message.mentions.members.first() ? message.mentions.members.first() : message.member
        if (message.member.id != target.id) {
            profileData = await profileModel.findOne({
                userID: target.id,
                serverID: message.guild.id
            })
            if (!profileData) {
                console.log(`FIN ${cmd.toUpperCase()}`)
                return message.reply("Ese pibe no ta en la BBDD")
            }
        } else {
            if (!profileData) {
                console.log(`FIN ${cmd.toUpperCase()}`)
                return message.reply("No tas inscrito en la Liga Udyr, maric\u00F3n. Haz un 'udyr puntos' antes")
            }
        }
        const avatar = await Canvas.loadImage(target.displayAvatarURL({ extension: 'png' }));
        context.font = `50px Courier`;
        // Draw a shape onto the main canvas
        context.drawImage(avatar, 90, 80, 650, 650);

        const background = await Canvas.loadImage('./images/magic.png');

        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Select the style that will be used to fill the text in
        context.fillStyle = '#000000';

        // Actually fill the text with a solid color
        context.fillText(target.displayName, canvas.width / 10.0, canvas.height / 13.0);

        // Actually fill the text with a solid color
        context.fillText(ponerSaltosDeLinea(profileData.descripcion), canvas.width / 8.1, canvas.height / 1.55);

        // Actually fill the text with a solid color
        context.fillText(profileData.udyrcoins, canvas.width / 5.6, canvas.height / 1.07);

        var puntos = profileData.nivel
        while (puntos >= 100) {
            puntos -= 100
        }
        // Actually fill the text with a solid color
        context.fillText(`${Math.floor(profileData.nivel / 100)}/${puntos}`, canvas.width / 1.35, canvas.height / 1.07);

        const udyrcoin = await Canvas.loadImage('./images/udyr.png');

        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(udyrcoin, canvas.width / 10.0, canvas.height / 1.115, 60, 60);


        // Use the helpful Attachment class structure to process the file for you
        //const attachment = new Attachment(,canvas.toBuffer(), 'profile-image.png');
        const attachment = new AttachmentBuilder(canvas.toBuffer());
        attachment.setName('profile-image.png')
        message.channel.send({ files: [attachment] });
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}