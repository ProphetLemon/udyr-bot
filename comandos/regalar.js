const { Message } = require('discord.js');
const profileModel = require('../models/profileSchema');
module.exports = {
    name: 'regalar',
    aliases: ['donar'],
    description: 'Funcion para regalar dinero a alguien',
    async execute(message, args, cmd, client, Discord, profileData) {
        if (args.length != 2) {
            console.log("INICIO REGALAR");
            return metodosUtiles.insultar(message)
        };
        const amount = args[0];
        const target = message.mentions.users.first();
        if (!target) {
            console.log("FIN REGALAR");
            return message.reply("ni mencionar usuarios sabes maric\u00F3n")
        };
        if (target.id == message.author.id) {
            console.log("FIN REGALAR");
            return metodosUtiles.insultar(message);
        }
        if (amount % 1 != 0 || amount <= 0) {
            console.log("FIN REGALAR");
            return message.reply("buen intento maric\u00F3n")
        };
        try {
            const targetData = await profileModel.findOne({ userID: target.id });
            if (!targetData) {
                console.log("FIN REGALAR");
                return message.reply("esa persona no esta en la base de datos maric\u00F3n")
            };
            if (amount > profileData.udyrcoins) {
                console.log("FIN REGALAR");
                return message.reply("ya te gustaria tener esos <:udyrcoin:825031865395445760> maric\u00F3n")
            };
            await profileModel.findOneAndUpdate({
                userID: message.author.id
            },
                {
                    $inc: {
                        ramoncitos: -amount,
                    },
                })
            await profileModel.findOneAndUpdate({
                userID: target.id
            },
                {
                    $inc: {
                        ramoncitos: amount,
                    },
                })
            var guildMembers = await message.guild.members.fetch();
            let member = guildMembers.find(member => member.id == target.id);
            console.log("FIN REGALAR");
            return message.channel.send(`${message.author.username} ha regalado ${amount} <:udyrcoin:825031865395445760> a ${member.displayName}.`);
        } catch (err) {
            console.log(err);
        }

    }
}