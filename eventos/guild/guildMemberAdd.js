const profileModel = require('../../models/profileSchema');

module.exports = async (client, discord, member) => {
    let ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    let profile = await profileModel.create({
        userID: member.id,
        serverID: member.guild.id,
        dailyGift: ayer,
        coins: 1000
    });
    profile.save();
};