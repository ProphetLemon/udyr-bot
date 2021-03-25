module.exports = {
   // name: 'donar',
    aliases: [],
    description: 'Funcion para donar a alguien puntos',
    execute(client, message, args, cmd) {
        var mencion = message.content.split(/ +/)[2];
        if (!metodosUtiles.isMention(mencion)) {
            insultar(message);
            return;
        }
        if (message.author.id != "202065665597636609") {
            metodosUtiles.insultar(message);
            return;
        }
        var puntos = Number(message.content.split(/ +/)[3]);
        var userID = mencion.slice(3, mencion.length - 1);
        for (let i = 0; i < personas.length; i++) {
            if (personas[i].userID == userID) {
                personas[i].puntos += puntos;
                message.reply("has dado " + puntos + " udyr coins al mendigo de " + message.guild.members.cache.get(userID).displayName);
                return;
            }
        }
        personas.push(new persona(new Date(), (1000 + puntos), userID));
        message.reply("has dado " + puntos + " udyr coins al mendigo de " + message.guild.members.cache.get(userID).displayName);
        message.delete();
    }
}