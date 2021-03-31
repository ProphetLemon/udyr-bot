const profileModel = require('../models/profileSchema');
module.exports = {
    name: 'regalar',
    aliases: [],
    description: 'Funcion para regalar dinero a alguien',
    async execute(message, args, cmd, client, Discord, profileData) {
        if (args.length != 2) return metodosUtiles.insultar(message);
        const amount = args[1];
        const target = message.mentions.users.first();
        if (!target) return message.reply("ni mencionar usuarios sabes maric\u00F3n");
        if (amount % 1 != 0 || amount <= 0) return message.reply("buen intento maric\u00F3n");
        try {
            const targetData = await profileModel.findOne({ userID: target.id });
            if (!targetData) return message.reply("esa persona no esta en la base de datos maric\u00F3n");
            if (amount > profileData.udyrcoins) return message.reply("ya te gustaria tener esos <:udyrcoin:825031865395445760> maric\u00F3n");
            await profileModel.findOneAndUpdate({
                userID: message.author.id
            },
                {
                    $inc: {
                        udyrcoins: -amount,
                    },
                })
            await profileModel.findOneAndUpdate({
                userID: target.id
            },
                {
                    $inc: {
                        udyrcoins: amount,
                    },
                })
            var guildMembers = await message.guild.members.fetch();
            let member = guildMembers.find(member => member.id == target.id);
            return message.channel.send(`${message.author.username} ha regalado ${amount} <:udyrcoin:825031865395445760> a ${member.displayName}.`);
        } catch (err) {
            console.log(err);
        }

    }
}