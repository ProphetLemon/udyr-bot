module.exports = {
    name: 'limpiar',
    description: 'Limpia el focus a alguien',
    execute(message,args,cmd,client,Discord,profileData) {
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