const profileModel = require('../models/profileSchema');

const { Message } = require('discord.js');
module.exports = {
    name: 'puntos',
    aliases: ['points', 'perfil'],
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
                udyrcoins: 500,
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
        if (cmd == 'perfil' || message.mentions.members.first() || moment(profileData.dailyGift).startOf('day').diff(moment(hoy).startOf('day'), "days") == 0 || ((profileData.wordle != undefined && moment(hoy).format("DD/MM/YYYY") == profileData.wordle) || (profileData.wordleEmpezado != undefined && profileData.wordleEmpezado == true))) {
            var personas = await profileModel.find();
            personas.sort(function (a, b) {
                return b.udyrcoins - a.udyrcoins;
            });
            var posicion = 0;
            for (let i = 0; i < personas.length; i++) {
                if (personas[i].userID == profileData.userID) {
                    posicion = i + 1;
                    break;
                }
            }
            var emoji;
            switch (posicion) {
                case 1:
                    emoji = "🥇";
                    break;
                case 2:
                    emoji = "🥈";
                    break;
                case 3:
                    emoji = "🥉";
                    break;
                case personas.length:
                    emoji = "💩";
                    break;
                default:
                    emoji = "";
                    break;
            }
            const newEmbed = new Discord.MessageEmbed()
                .setColor("#B17428")
                .setThumbnail(author.avatarURL())
                .setAuthor(`Perfil de ${target != undefined ? target.displayName : message.member.displayName}`)
                .setDescription(`${profileData.descripcion}`)
                .addFields(
                    { name: "Ranking", value: `${posicion} ${emoji}`, inline: true },
                    { name: "<:udyrcoin:961729720104419408>", value: `${profileData.udyrcoins}`, inline: true }
                )
            message.channel.send(newEmbed).then(msg => {
                if (cmd != 'perfil') {
                    msg.delete({ timeout: 10000 });
                }
                message.delete();
            });
        } else {
            const randomNumber = Math.floor(Math.random() * 31) + 20;
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
            var targetData;
            message.channel.send(`${message.member.displayName} ha canjeado la recompensa diaria y consigui\u00F3 ${randomNumber} <:udyrcoin:961729720104419408>`).then(msg => {
                msg.delete({ timeout: 10000 });
            });
            var personas = await profileModel.find();
            personas.sort(function (a, b) {
                return b.udyrcoins - a.udyrcoins;
            });
            var posicion = 0;
            for (let i = 0; i < personas.length; i++) {
                if (personas[i].userID == profileData.userID) {
                    targetData = personas[i];
                    posicion = i + 1;
                    break;
                }
            }
            var emoji;
            switch (posicion) {
                case 1:
                    emoji = "🥇";
                    break;
                case 2:
                    emoji = "🥈";
                    break;
                case 3:
                    emoji = "🥉";
                    break;
                case personas.length:
                    emoji = "💩";
                    break;
                default:
                    emoji = "";
                    break;
            }
            const newEmbed = new Discord.MessageEmbed()
                .setColor("#B17428")
                .setThumbnail(message.author.avatarURL())
                .setAuthor(`Perfil de ${message.member.displayName}`)
                .setDescription(`${profileData.descripcion}`)
                .addFields(
                    { name: "Ranking", value: `${posicion} ${emoji}`, inline: true },
                    { name: "<:udyrcoin:961729720104419408>", value: `${profileData.udyrcoins}`, inline: true }
                )
            message.channel.send(newEmbed).then(msg => {
                msg.delete({ timeout: 10000 });
                message.delete();
            });
        }
        console.log("FIN PUNTOS");
    }
}