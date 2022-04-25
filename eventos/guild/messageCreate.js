const { Client, Message, Discord } = require("discord.js");
require('dotenv').config();
const profileModel = require('../../models/profileSchema');
const diaModel = require('../../models/diaSchema');
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
    felicitarDia(message)
    let profileData;
    try {
        profileData = await profileModel.findOne({ userID: message.author.id, serverID: message.guild ? message.guild.id : "598896817157046281" });
        if (profileData) {
            if ((profileData.nivel + 1) % 100 == 0) {
                message.channel.send(`Has subido de nivel!\nAhora sos level ${(profileData.nivel + 1) / 100}`)
            }
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild ? message.guild.id : "598896817157046281"
            }, {
                $inc: {
                    nivel: 1
                }
            })
        }
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

/**
 * 
 * @param {Message} message 
 */
async function felicitarDia(message) {
    if (!message.guild || message.guild.id != "598896817157046281") {
        return
    }
    var hoy = new Date()
    var diaServer = await diaModel.findOne({
        serverID: "598896817157046281"
    })
    if (!diaServer) {
        var diaCreate = await diaModel.create({
            serverID: "598896817157046281",
            dia: hoy
        })
        await diaCreate.save()
        var hora = hoy.getHours()
        if (hora >= 21 || hora < 5) {
            message.channel.send("Primero de todo, buenas noches")
        } else if (hora >= 5 && hora < 13) {
            message.channel.send("Primero de todo, buenos dias")
        } else if (hora >= 13 && hora < 21) {
            message.channel.send("Primero de todo, buenos tardes")
        }
    } else {
        if (diaServer.dia.getDate() == hoy.getDate()) {
            return
        } else {
            await diaModel.findOneAndUpdate({
                serverID: message.guild.id
            }, {
                $set: {
                    dia: hoy
                }
            })
            var hora = hoy.getHours()
            if (hora >= 21 || hora < 5) {
                message.channel.send("Primero de todo, buenas noches")
            } else if (hora >= 5 && hora < 13) {
                message.channel.send("Primero de todo, buenos dias")
            } else if (hora >= 13 && hora < 21) {
                message.channel.send("Primero de todo, buenos tardes")
            }
        }
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
        message.channel.send({
            files: [{
                attachment: "./images/vikingos.gif",
                name: 'file.png'
            }]
        })
        return;
    }
    var ruleta = Math.floor(Math.random() * 20);
    console.log(ruleta);
    if (ruleta == 5) { //por el culo te la hinco jaja
        metodosUtiles.insultar(message);
    }
}