const profileModel = require('../models/profileSchema');
module.exports = {
    name: 'puntos',
    aliases: [],
    description: 'Funcion para saber los puntos que tienes',
    async execute(message, args, cmd, client, Discord, profileData) {    
        let hoy = new Date();
        hoy.setHours(hoy.getHours()+horasDiferencia);
        if (profileData.dailyGift.getDate()==hoy.getDate()){
            const newEmbed = new Discord.MessageEmbed()
            .setColor("#B17428")
            .setAuthor(`Udyr coins de ${message.member.displayName}`,message.author.avatarURL())
            .setDescription(`**${profileData.udyrcoins}** <:udyrcoin:825031865395445760>`)
            message.channel.send(newEmbed); 
        }   else{
            const randomNumber = Math.floor(Math.random() * 31) + 20;
            await profileModel.findOneAndUpdate(
                {
                    userID: message.author.id
                },
                {
                    $inc: {
                        udyrcoins: randomNumber
                    },
                    $set:{
                        dailyGift:hoy
                    }
                }
            );
            const targetData = await profileModel.findOne({userID: message.author.id});
            message.channel.send(`${message.member.displayName} ha canjeado la recompensa diaria y consigui\u00F3 ${randomNumber} udyr coins`);
            const newEmbed = new Discord.MessageEmbed()
            .setColor("#B17428")
            .setAuthor(`Udyr coins de ${message.member.displayName}`,message.author.avatarURL())
            .setDescription(`**${targetData.udyrcoins}** <:udyrcoin:825031865395445760>`)
            message.channel.send(newEmbed); 
        }
        
    }
}