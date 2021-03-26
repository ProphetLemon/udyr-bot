const { Client, Message, Discord } = require("discord.js");
require('dotenv').config();
/**
 * 
 * @param {Discord} Discord
 * @param {Client} client
 * @param {Message} message
 */
module.exports = (Discord, client, message) => {
    const prefix = process.env.PREFIX+" ";
    var canales_de_texto = ["598896817161240663", "809786674875334677"];
    if (message.author.bot || !canales_de_texto.includes(message.channel.id)) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    if (command){
        command.execute(client, message, args,cmd, Discord);
    } else{
        ruleta(message);
    }
}

function ruleta(message) {
    if (message.content.charAt(message.content.length - 1) == '5' || message.content.slice(message.content.length - 5, message.content.length).trim() == "cinco") {
        message.reply("por el culo te la hinco, maric\u00F3n");
        return;
    }
    if (message.content.trim().toLowerCase()=="vikingos"){
        message.channel.send("LA👊PUTA👊MEJOR👊SERIE👊", { files: ["./images/vikingos.gif"] });
        return;
    }
    var ruleta = Math.floor(Math.random() * 20);
    console.log(ruleta);
    if (ruleta == 5) { //por el culo te la hinco jaja
        metodosUtiles.insultar(message);
    }
}