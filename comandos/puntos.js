module.exports = {
    name: 'puntos',
    aliases: [],
    description: 'Funcion para saber los puntos que tienes o canjear los mierdas diarias',
    execute(client, message, args, cmd) {
        var existe = false;
        var posicion = 0;
        for (var i = 0; i < personas.length; i++) {
            if (personas[i].userID == message.author.id) {
                existe = true;
                posicion = i;
                break;
            }
        }
        let dateNow = new Date();
        dateNow.setHours(dateNow.getHours() - horasDiferencia);
        if (!existe) {
            var puntos_random = Math.floor(Math.random() * 30) + 21;
            personas.push(new persona(dateNow, (1000 + puntos_random), message.author.id));
            message.reply("\u00A1Has canjeado la recompensa diaria, has ganado " + puntos_random + " udyr coins!\nTienes " + (1000 + puntos_random) + " udyr coins.");
        }
        else {
            var autor = personas[posicion];
            if (metodosUtiles.isSameDay(autor.dia, dateNow)) {
                message.reply("tienes " + autor.puntos + " udyr coins");
            }
            else {
                var puntos_random = Math.floor(Math.random() * 31) + 20;
                autor.puntos += puntos_random;
                message.reply("\u00A1Has canjeado la recompensa diaria, has ganado " + puntos_random + " udyr coins!\nTienes " + autor.puntos + " udyr coins.");
                autor.dia = dateNow;
                personas[posicion] = autor;
            }
        }
    }
}