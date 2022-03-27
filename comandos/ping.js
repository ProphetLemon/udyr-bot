const { Message } = require("discord.js")

module.exports = {
    name: 'ping',
    description: "Mi propio commando ping",
    /**
     * 
     * @param {Message} message
     * @param {string[]} args
     */
    execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO PING");
        var reykjavik = moment.tz(moment().format("YYYY-MM-DD HH:mm:ss"), "Atlantic/Reykjavik")
        var dateNow = new Date(reykjavik.clone().tz("Europe/Madrid").format(`MMMM DD, YYYY HH:mm:ss`))
        message.channel.send(`🏓 Hay una latencia de ${dateNow - message.createdTimestamp} ms\nLa fecha del servidor es ${dateNow.getDate()}/${dateNow.getMonth() + 1} ${dateNow.getHours()}:${dateNow.getMinutes()}`);
        console.log("FIN PING");
    }
}

