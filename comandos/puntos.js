const profileModel = require('../models/profileSchema');

const { Message, MessageEmbed } = require('discord.js');
module.exports = {
    name: 'puntos',
    aliases: ['points'],
    description: 'Funcion para saber los puntos que tienes',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO PUNTOS");
        if (!profileData) {
            var ayer = new Date();
            ayer.setDate(ayer.getDate() - 1);
            let profile = await profileModel.create({
                userID: message.author.id,
                serverID: message.guild.id,
                udyrcoins: 1000,
                dailyGift: ayer,
                robar: ayer
            });
            await profile.save();
            profileData = profile
        }
        var author = message.author
        if (message.mentions.members.first()) {
            var target = message.mentions.members.first()
            author = target.user
            profileData = await profileModel.findOne({
                userID: target.id,
                serverID: message.guild.id
            })
        }
        var hoy = moment().toDate()
        if (profileData.userID != message.author.id || moment(profileData.dailyGift).startOf('day').diff(moment(hoy).startOf('day'), "days") == 0 || ((profileData.wordle != undefined && moment(hoy).format("DD/MM/YYYY") == profileData.wordle) || (profileData.wordleEmpezado != undefined && profileData.wordleEmpezado == true))) {
            return message.channel.send(`Tiene${message.author.id == profileData.userID ? "s" : ""} ${profileData.udyrcoins} <:udyrcoin:961729720104419408>`)
        } else {
            const randomNumber = (Math.floor(Math.random() * 31) + 20) * 10;
            await profileModel.findOneAndUpdate(
                {
                    userID: profileData.userID
                },
                {
                    $inc: {
                        udyrcoins: randomNumber
                    },
                    $set: {
                        dailyGift: hoy
                    }
                }
            );
            message.channel.send(`${message.member.displayName} ha canjeado la recompensa diaria y consigui\u00F3 ${randomNumber} <:udyrcoin:961729720104419408>`);
            client.commands.get("perfil").execute(message, args, 'perfil', client, Discord, profileData);
        }
        console.log("FIN PUNTOS");
    }
}