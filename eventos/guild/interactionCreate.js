const { Client } = require("discord.js")
const Discord = require("discord.js")
/**
 * 
 * @param {Discord} Discord 
 * @param {Client} client 
 * @param {Discord.Interaction} interaction
 */
module.exports = (Discord, client, interaction) => {
    if (!interaction.isCommand()) {
        return
    }
    const { commandName, options } = interaction
    if (commandName == 'estado') {
        client.user.setPresence({
            status: options.getString("status"), activities: [{ name: options.getString("descripcion"), type: options.getNumber("activitytype"), url: options.getString("url") }]
        })
        return interaction.reply({
            content: "Se ha cambiado correctamente el estado",
            ephemeral: true
        })
    }
}