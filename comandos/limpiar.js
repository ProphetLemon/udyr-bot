module.exports = {
    name: 'limpiar',
    description: 'Limpia el focus a alguien',
    execute(client, message, args, cmd) {
        if (timeOutFocus != undefined) {
            clearTimeout(timeOutFocus);
            timeOutFocus = undefined;
            focusID = "";
            message.channel.send("Se ha quitado el focus correctamente!");
        }
        else {
            metodosUtiles.insultar(message);
        }
    }
}