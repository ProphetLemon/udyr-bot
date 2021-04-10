const profileModel = require('../models/profileSchema');
module.exports = {
    name: 'puntos',
    aliases: [],
    description: 'Funcion para saber los puntos que tienes',
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO PUNTOS");
        let hoy = new Date();
        hoy.setHours(hoy.getHours() - horasDiferencia);
        if (profileData.dailyGift.getDate() == hoy.getDate()) {
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
                .setAuthor(`Perfil de ${message.member.displayName}`, message.author.avatarURL())
                .setDescription(`**Udyr coins:** ${profileData.udyrcoins} <:udyrcoin:825031865395445760>\n**Ranking:** ${posicion} ${emoji}`)
            message.channel.send(newEmbed).then(msg => {
                msg.delete({ timeout: 10000 });
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
            message.channel.send(`${message.member.displayName} ha canjeado la recompensa diaria y consigui\u00F3 ${randomNumber} <:udyrcoin:825031865395445760>`).then(msg => {
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
                .setAuthor(`Perfil de ${message.member.displayName}`, message.author.avatarURL())
                .setDescription(`**Udyr coins:** ${targetData.udyrcoins} <:udyrcoin:825031865395445760>\n**Ranking:** ${posicion} ${emoji}`)
            message.channel.send(newEmbed).then(msg => {
                msg.delete({ timeout: 10000 });
                message.delete();
            });
        }
        console.log("FIN PUNTOS");
    }
}