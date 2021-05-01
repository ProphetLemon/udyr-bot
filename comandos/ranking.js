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
        var guildRoles = await message.guild.roles.fetch();
        var rolAdmin = guildRoles.cache.find(role => role.id == "821374417660542976");
        var mensaje = "";
        const newEmbed = new Discord.MessageEmbed()
            .setColor("#B17428")
            .setAuthor(`🏆Ranking de udyr coins🏆`);
        var hoy = new Date();
        hoy.setHours(hoy.getHours() - horasDiferencia);
        for (let i = 0; i < personas.length; i++) {
            let competidor = personas[i];
            var member = guildMembers.find(member => competidor.userID == member.id);
            if (member.roles.cache.get(rolAdmin.id)) {
                mensaje += `<:1990_praisethesun:602528888400379935> `
            }
            if (i == 2) {
                mensaje += `🥉 `;
            } else if (i == 1) {
                mensaje += `🥈 `;
            } else if (i == 0) {
                mensaje += `🥇 `;
            } else if (i == personas.length - 1) {
                mensaje += `💩 `;
            } else {
                mensaje += `${i + 1}.- `;
            }
            mensaje += `${member.displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate() != hoy.getDate() ? "_no ha canjeado la recompensa diaria_" : ""}${member.roles.cache.get(rolAdmin.id) ? " <:1990_praisethesun:602528888400379935>" : ""}\n`;
        }
        newEmbed.setDescription(mensaje)
        message.channel.send(newEmbed).then(msg => {
            message.delete();
        });
        console.log("FIN RANKING");
    }
}