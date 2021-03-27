module.exports = {
    name: 'limpiar',
    description: 'Limpia el focus a alguien',
    execute(message, args, cmd, client, Discord, profileData) {
        let numeroMensajes = args[0];
        if (numeroMensajes) {
            if (numeroMensajes % 1 != 0 || numeroMensajes <= 0) return metodosUtiles.insultar(message);
            message.channel.bulkDelete(Number(numeroMensajes) + 1);
            setTimeout(function () {
                message.channel.send(`Se han eliminado ${numeroMensajes} mensajes`).then(msg => {
                    msg.delete({ timeout: 3000 })
                })
            }, 1000);
        } else {
            if (timeOutFocus != undefined) {
                clearTimeout(timeOutFocus);
                timeOutFocus = undefined;
                focusID = "";
                message.channel.send("Se ha quitado el focus correctamente!").then(msg => { msg.delete({ timeout: 2000 }) });
            }
            else {
                metodosUtiles.insultar(message);
            }
        }

    }
}