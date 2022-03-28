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
        message.channel.send(`🏓 Pong\nLa fecha del servidor es ${String(dateNow.getDate()).padStart(2, "0")}/${String(dateNow.getMonth() + 1).padStart(2, "0")} ${String(dateNow.getHours()).padStart(2, "0")}:${String(dateNow.getMinutes()).padStart(2, "0")}`)
            .then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 6000);
            });
        console.log("FIN PING");
    }
}

