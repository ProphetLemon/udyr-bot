module.exports = {
    name: 'dado',
    aliases: [],
    description: 'Funcion que tira uno o varios dados de 6 o varias caras',
    execute(message,args,cmd,client,Discord,profileData) {
        var numero = args[0];
        var tiradas = args[1];
        if (numero == undefined) {
            numero = 6;
        }
        else {
            if (!metodosUtiles.isValidNumber(numero)) {
                metodosUtiles.insultar(message);
                return;
            }
        }
        if (tiradas == undefined) {
            tiradas = 1;
        }
        else {
            if (!metodosUtiles.isValidNumber(tiradas)) {
                metodosUtiles.insultar(message);
                return;
            }
        }
        var mensaje = "";
        for (var i = 0; i < tiradas; i++) {
            if (i != 0) {
                mensaje += "\n";
            }
            mensaje += ":game_die:" + (Math.floor(Math.random() * numero) + 1) + ":game_die:";
        }
        message.reply(mensaje);
    }
}