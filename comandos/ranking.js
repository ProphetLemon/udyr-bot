const { Message, Client, EmbedBuilder } = require('discord.js');
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
        return;
        return;
        console.log("INICIO RANKING");
        var personas = await profileModel.find({
            serverID: message.guild.id
        });
        personas.sort(function (a, b) {
            return b.udyrcoins - a.udyrcoins;
        });
        var guildMembers = await message.guild.members.fetch();
        var guildRoles = await message.guild.roles.fetch();
        var rolAdmin = guildRoles.get("855758139140079646")
        var mensaje = "";
        const newEmbed = new EmbedBuilder()
            .setColor("#B17428")
            .setAuthor({ name: `🏆Ranking de udyrcoins🏆` });
        var hoy = moment().toDate()
        let adminLocalizado = false;
        for (let i = 0; i < personas.length; i++) {
            let competidor = personas[i];
            var member = guildMembers.get(competidor.userID)
            if (member.roles.cache.has(rolAdmin.id)) {
                mensaje += `<:1990_praisethesun:602528888400379935> `
                adminLocalizado = true;
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
            mensaje += `${member.displayName} - ${metodosUtiles.numberWithCommas(competidor.udyrcoins)} <:udyrcoin:961729720104419408> ${(moment(competidor.dailyGift).startOf('day').diff(moment(hoy).startOf('day'), "days") != 0 && ((competidor.wordle == undefined || moment(hoy).format("DD/MM/YYYY") != competidor.wordle) && (competidor.wordleEmpezado == undefined || competidor.wordleEmpezado == false))) ? "_no ha canjeado la recompensa diaria_" : ""} ${member.roles.cache.has(rolAdmin.id) ? "<:1990_praisethesun:602528888400379935>" : ""}\n`;
        }
        if (!adminLocalizado) {
            for (let i = 10; i < personas.length; i++) {
                let competidor = personas[i];
                var member = guildMembers.get(competidor.userID)
                if (member == undefined) {
                    personas.splice(i, 1);
                    i = i - 1;
                    continue;
                }
                if (member.roles.cache.has(rolAdmin.id)) {
                    mensaje += `<:1990_praisethesun:602528888400379935> ${i + 1}.- ${member.displayName} - ${metodosUtiles.numberWithCommas(competidor.udyrcoins)} <:udyrcoin:961729720104419408> ${(moment(profileData.dailyGift).startOf('day').diff(moment(hoy).startOf('day'), "days") != 0 && ((profileData.wordle != undefined && moment(hoy).format("DD/MM/YYYY") != profileData.wordle) && (profileData.wordleEmpezado != undefined && profileData.wordleEmpezado == false))) ? "_no ha canjeado la recompensa diaria_" : ""} <:1990_praisethesun:602528888400379935>\n`;
                    break;
                }
            }
        }
        newEmbed.setDescription(mensaje)
        message.channel.send({ embeds: [newEmbed] }).then(msg => {
            message.delete();
        });
        console.log("FIN RANKING");
    }
}