const { Message, Client } = require('discord.js');
const profileModel = require('../models/profileSchema');
module.exports = {
    name: 'ranking',
    aliases: ['rank'],

    description: 'Funcion ver el raking de puntos',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO RANKING");
        var personas = await profileModel.find({
            serverID: message.guild.id
        });
        personas.sort(function (a, b) {
            return b.udyrcoins - a.udyrcoins;
        });
        var guildMembers = await message.guild.members.fetch();
        var guildRoles = await message.guild.roles.fetch();
        var rolAdmin = guildRoles.cache.find(role => role.name == "El Admin");
        var mensaje = "";
        const newEmbed = new Discord.MessageEmbed()
            .setColor("#B17428")
            .setAuthor(`🏆Ranking de udyrcoins🏆`);
        var hoy = getCETorCESTDate()
        let adminLocalizado = false;
        for (let i = 0; i < personas.length; i++) {
            let competidor = personas[i];
            var member = guildMembers.find(member => competidor.userID == member.id);
            if (member.roles.cache.get(rolAdmin.id)) {
                mensaje += `<:1990_praisethesun:602528888400379935> `
                adminLocalizado = true;
            }
            if (i == 2) {
                mensaje += `🥉 `;
            } else if (i == 1) {
                mensaje += `🥈 `;
            } else if (i == 0) {
                mensaje += `🥇 `;
            } else if (i == personas.length - 1 || i == 9) {
                mensaje += `💩 `;
            } else {
                mensaje += `${i + 1}.- `;
            }
            mensaje += `${member.displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate() != hoy.getDate() ? "_no ha canjeado la recompensa diaria_" : ""}${member.roles.cache.get(rolAdmin.id) ? " <:1990_praisethesun:602528888400379935>" : ""}\n`;
        }
        if (!adminLocalizado) {
            mensaje = mensaje.split("💩")[0];
            for (let i = 10; i < personas.length; i++) {
                let competidor = personas[i];
                var member = guildMembers.find(member => competidor.userID == member.id);
                if (member == undefined) {
                    personas.splice(i, 1);
                    i = i - 1;
                    continue;
                }
                if (member.roles.cache.get(rolAdmin.id)) {
                    mensaje += `<:1990_praisethesun:602528888400379935> ${i + 1}.- ${member.displayName} - ${competidor.udyrcoins} <:udyrcoin:825031865395445760> ${competidor.dailyGift.getDate() != hoy.getDate() ? "_no ha canjeado la recompensa diaria_" : ""} <:1990_praisethesun:602528888400379935>\n`;
                    break;
                }
            }
        }
        newEmbed.setDescription(mensaje)
        message.channel.send(newEmbed).then(msg => {
            message.delete();
        });
        console.log("FIN RANKING");
    }
}