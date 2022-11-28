const { Message } = require("discord.js");

module.exports = {
    name: 'limpiar',
    description: 'Limpia el focus a alguien',
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
    execute(message, args, cmd, client, Discord, profileData) {
        return;
        console.log("INICIO LIMPIAR");
        let numeroMensajes = args[0];
        if (numeroMensajes) {
            if (numeroMensajes % 1 != 0 || numeroMensajes <= 0) {
                console.log("FIN LIMPIAR");
                return metodosUtiles.insultar(message)
            };
            if (numeroMensajes > 99) {
                return metodosUtiles.insultar(message)
            }
            message.channel.bulkDelete(Number(numeroMensajes) + 1).catch(console.error);
            setTimeout(function () {
                message.channel.send(`Se han eliminado ${numeroMensajes} mensajes`).then(msg => {
                    setTimeout(() => {
                        msg.delete()
                    }, 3000);
                })
            }, 1000);
        } else {
            if (timeOutFocus != undefined) {
                clearTimeout(timeOutFocus);
                timeOutFocus = undefined;
                focusID = "";
                message.channel.send("Se ha quitado el focus correctamente!").then(msg => {
                    setTimeout(() => {
                        msg.delete()
                    }, 2000);
                });
            }
            else {
                metodosUtiles.insultar(message);
            }
        }
        console.log("FIN LIMPIAR");
    }
}