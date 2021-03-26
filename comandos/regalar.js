const { Message } = require('discord.js');
const profileModel = require('../models/profileSchema');
module.exports = {
    name: 'regalar',
    aliases: [],
    description: 'Funcion para regalar dinero a alguien',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     * @returns 
     */
   async execute(message, args, cmd, client, Discord, profileData) {
       if (args.length != 2) return metodosUtiles.insultar(message);
        const amount = args[1];
        const target = message.mentions.users.first();
        if (!target) return metodosUtiles.insultar(message);
        if (amount % 1 !=0 || amount<=0)  return metodosUtiles.insultar(message);        
        try{
            const targetData = await profileModel.findOne({userID: target.id});
            if (!targetData) return message.channel.send("Esa persona no esta en la base de datos");
            if (amount > profileData.udyrcoins)  return metodosUtiles.insultar(message);
            await profileModel.findOneAndUpdate({
                userID:message.author.id
            },
            {
                $inc:{
                    udyrcoins:-amount,                   
                },
            })
            await profileModel.findOneAndUpdate({
                userID:target.id
            },
            {
                $inc:{
                    udyrcoins:amount,                   
                },
            })
            var guildMembers = await message.guild.members.fetch();
            let member = guildMembers.find(member => member.id == target.id);
            return message.channel.send(`${message.author.username} ha regalado ${amount} udyr coins a ${member.displayName}.`);
        }catch(err){
            console.log(err);
        }
        
    }
}