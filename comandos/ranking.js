global.personas = [];
const profileModel = require('../models/profileSchema');
module.exports = {
    name: 'ranking',
    aliases: ['rank'],
    description: 'Funcion ver el raking de puntos',
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO RANKING");
        var personas = await profileModel.find();
        personas.sort(function (a, b) {
            return b.udyrcoins - a.udyrcoins;
        });
        var guildMembers = await message.guild.members.fetch();
        var mensaje = "";
        const newEmbed = new Discord.MessageEmbed()
            .setColor("#B17428")
            .setAuthor(`🏆Ranking de udyr coins🏆`);
            var hoy = new Date();
            hoy.setHours(hoy.getHours()-horasDiferencia);
        for (let i = 0; i < personas.length; i++) {
            let competidor = personas[i];
            if (i == 2) {
                mensaje += `🥉 ${guildMembers.find(member => competidor.userID == member.id).displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate()!=hoy.getDate()?"_no ha canjeado la recompensa diaria_":""}\n`;
            } else if (i == 1) {
                mensaje += `🥈 ${guildMembers.find(member => competidor.userID == member.id).displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate()!=hoy.getDate()?"_no ha canjeado la recompensa diaria_":""}\n`;
            } else if (i == 0) {
                mensaje += `🥇 ${guildMembers.find(member => competidor.userID == member.id).displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate()!=hoy.getDate()?"_no ha canjeado la recompensa diaria_":""}\n`;
            } else if (i == personas.length - 1) {
                mensaje += `💩 ${guildMembers.find(member => competidor.userID == member.id).displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate()!=hoy.getDate()?"_no ha canjeado la recompensa diaria_":""}`;
            } else {
                mensaje += `${i + 1}.- ${guildMembers.find(member => competidor.userID == member.id).displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate()!=hoy.getDate()?"_no ha canjeado la recompensa diaria_":""}\n`;
            }
        }
        newEmbed.setDescription(mensaje)
        message.channel.send(newEmbed).then(msg => {
            message.delete();
        });
        console.log("FIN RANKING");
    }
}