global.focusID = "";
global.timeOutFocus = 0;
var messageCopy;
module.exports = {
    name: 'focus',
    description: 'Funcion para retar a alguien',
    execute(client, message, args, cmd) {
        if (focusID != "") {
            message.reply("ya estoy insultando, d\u00E9jame tranquilo");
            return;
        }
        let user = message.content.split(/ +/)[2];
    
        if (metodosUtiles.isMention(user) == false) {
            metodosUtiles.insultar(message)
            return;
        }
        let minutos = message.content.split(/ +/)[3];
        if (minutos == undefined) {
            minutos = 10;
        }
        if (!metodosUtiles.isValidNumber(minutos)) {
            metodosUtiles.insultar(message);
            return;
        }
        messageCopy = message;
        message.delete();
        focusID = user.slice(3, user.length - 1);
        messageCopy.channel.send("<@!" + focusID + ">" + " cementerio de choripanes");
        let aux = setTimeout(function () {
            minutos -= 2;
            focusBucle(minutos, messageCopy,client);
        }, 120_000);
        timeOutFocus = aux;
    }
}
function focusBucle(minutos, message,client) {
    if (minutos <= 0) {
        const command = client.commands.get("limpiar");
        command.execute(client, message);
        return;
    }
    message.channel.send("<@!" + focusID + ">" + " cementerio de choripanes");
    let aux = setTimeout(function () {
        minutos -= 2;
        focusBucle(minutos, message);
    }, 120_000);
    timeOutFocus = aux;
}