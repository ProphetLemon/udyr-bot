const { Client, Message, Discord } = require("discord.js");
require('dotenv').config();
const profileModel = require('../../models/profileSchema');

/**
 * 
 * @param {Discord} Discord
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (Discord, client, message) => {
    const prefix = process.env.PREFIX + " ";
    if (message.author.bot || message.channel.id == "953974289919520778") return;
    if (message.author.id == focusID) {
        message.member.send("Callate maric\u00F3n");
        message.delete();
    }
    let profileData;
    try {
        profileData = await profileModel.findOne({ userID: message.author.id });
    } catch (err) {
        console.log(err);
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd.toLocaleLowerCase()) || client.commands.find(a => a.aliases && a.aliases.includes(cmd.toLocaleLowerCase()));
    if (command && message.content.toLowerCase().startsWith(prefix)) {
        command.execute(message, args, cmd, client, Discord, profileData);
    } else if (message.content.toLowerCase().startsWith(prefix)) {
        metodosUtiles.insultar(message);
    } else {
        ruleta(message);
    }
}

function ruleta(message) {
    if (message.content.charAt(message.content.length - 1) == '5' || message.content.slice(message.content.length - 5, message.content.length).trim() == "cinco") {
        message.reply("por el culo te la hinco, maric\u00F3n");
        return;
    }
    if (message.content.trim().toLowerCase() == "a" || message.content.trim().toLowerCase() == "ª") {
        message.channel.send("https://c.tenor.com/K_fk1dEUTzcAAAAC/mister-jagger-a.gif")
        return
    }
    if (message.content.trim().toLowerCase() == "vikingos") {
        message.channel.send("LA👊PUTA👊MEJOR👊SERIE👊", { files: ["./images/vikingos.gif"] });
        return;
    }
    var ruleta = Math.floor(Math.random() * 20);
    console.log(ruleta);
    if (ruleta == 5) { //por el culo te la hinco jaja
        metodosUtiles.insultar(message);
    }
}