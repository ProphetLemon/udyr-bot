global.personas = [];
module.exports = {
    name: 'ranking',
    description: 'Funcion ver el raking de puntos',
    execute(client, message, args, cmd) {
        personas.sort(function (a, b) {
            return b.puntos - a.puntos;
        });
        var mensaje = "";
        for (let i = 0; i < personas.length; i++) {
            let competidor = personas[i];
            if (i == personas.length - 1) {
                mensaje += (i + 1) + " - " + message.guild.members.cache.get(competidor.userID).displayName + " con " + competidor.puntos;
            }
            else {
                mensaje += (i + 1) + " - " + message.guild.members.cache.get(competidor.userID).displayName + " con " + competidor.puntos + "\n";
            }
        }
        message.channel.send(mensaje);
    }
}