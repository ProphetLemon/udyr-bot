const { Client, Discord } = require("discord.js");

/**
 * @param {Discord} Discord
 * @param {Client} client
 */
module.exports = (Discord, client) => {
    client.user.setPresence({
        status: "dnd",
        activities: [{ name: 'minar udyrcoins 💰', type: "PLAYING" }]
    })
    console.log("El bot ta ready");
}
