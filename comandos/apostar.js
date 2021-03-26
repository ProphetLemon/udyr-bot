const profileModel = require('../models/profileSchema');
class apostador {
    /**
     * Bando de apuestas
     * @param {string} userID id del apostador
     * @param {string} bando bando que apuesta
     * @param {number} puntos puntos que ha apostado
     */
    constructor(userID, puntos, bando) {
        this.userID = userID;
        this.puntos = puntos;
        this.bando = bando;
    }
}

class apuesta {
    /**
     * Apuesta
     * @param {string} nombre Nombre de la apuesta
     * @param {string} autor Creador de la apuesta
     * @param {apostador[]} apostadores que ha apostado
     */
    constructor(nombre, autor, apostadores) {
        this.nombre = nombre;
        this.autor = autor;
        this.apostadores = apostadores;
    }
}


var apuesta_actual = new apuesta(undefined, undefined, undefined);
var nombre_bandos = [];
module.exports = {
    name: 'apostar',
    aliases: ['apuesta', 'cerrar'],
    description: 'Funcion para crear apuestas o apostar en ellas',
    async execute(message, args, cmd, client, Discord, profileData) {
        if (cmd == "apuesta") {
            if (apuesta_actual.nombre != undefined) {
                message.channel.send("Ya existe una apuesta activa (" + apuesta_actual.nombre + "), cierrala para poder crear otra");
                return;
            }
            let args = message.content.split("\"");
            nombre_bandos.push(args[3]);
            nombre_bandos.push(args[5]);
            apuesta_actual = new apuesta(args[1], message.author.id, []);
            message.channel.send("Se ha creado la apuesta \"" + apuesta_actual.nombre + "\"");
        } else if (cmd == "apostar") {
            if (apuesta_actual.nombre == undefined) {
                message.reply("No existe una apuesta activa, maric\u00F3n");
                return;
            }

            let nombre = message.author.id;
            let bando = message.content.split("\"")[1];
            if (!nombre_bandos.includes(bando)) return metodosUtiles.insultar(message);;

            let puntos = Number(message.content.split("\"")[2]);
            if (profileData.udyrcoins == 0) {
                message.reply("No tienes puntos, canjealos con el comando 'udyr puntos'");
                return;
            } else if (profileData.udyrcoins < puntos) {
                message.reply("Ya te molaria tener esos puntos maric\u00F3n");
                return;
            }
            let existe = false;
            for (let i = 0; i < apuesta_actual.apostadores.length; i++) {
                if (apuesta_actual.apostadores[i].userID == message.author.id) {
                    existe = true;
                    if (apuesta_actual.apostadores[i].bando != bando) {
                        metodosUtiles.insultar(message);
                        return;
                    } else {
                        apuesta_actual.apostadores[i].puntos += puntos;
                        cambiar_puntos(message.author.id, String("-" + puntos));
                        message.reply("Tu apuesta es ahora de " + apuesta_actual.apostadores[i].puntos + " udyr coins");
                    }
                }
            }
            if (!existe) {
                cambiar_puntos(nombre, "-" + puntos);
                apuesta_actual.apostadores.push(new apostador(nombre, puntos, bando));
                message.reply("Has apostado por '" + bando + "' con " + puntos + " udyr coins")
            }

        } else if (cmd = "cerrar") {
            if (apuesta_actual.autor != message.author.id) {
                message.reply("no hiciste tu la apuesta maric\u00F3n");
                return;
            }
            let bando_ganador = message.content.split("\"")[1];
            let puntos_ganador = 0;
            let puntos_perdedor = 0;
            for (let i = 0; i < apuesta_actual.apostadores.length; i++) {
                if (apuesta_actual.apostadores[i].bando == bando_ganador) {
                    puntos_ganador += apuesta_actual.apostadores[i].puntos;
                }
                else {
                    puntos_perdedor += apuesta_actual.apostadores[i].puntos;
                }
            }
            let ROI = (puntos_perdedor / puntos_ganador) + 1;
            message.channel.send("Se ha cerrado la apuesta \"" + apuesta_actual.nombre + "\"");
            for (let i = 0; i < apuesta_actual.apostadores.length; i++) {
                if (apuesta_actual.apostadores[i].bando == bando_ganador) {
                    let puntos = Math.floor(apuesta_actual.apostadores[i].puntos * ROI);
                    cambiar_puntos(apuesta_actual.apostadores[i].userID, ("+") + (puntos));
                    const targetData = await profileModel.findOne({ userID: apuesta_actual.apostadores[i].userID });
                    message.channel.send(message.guild.members.cache.get(apuesta_actual.apostadores[i].userID).displayName + " ha ganado " + puntos + " udyr coins (" + targetData.udyrcoins + " en total)");
                }
            }
            apuesta_actual = new apuesta(undefined, undefined, undefined);
            nombre_bandos = [];
        }
    }
}

async function cambiar_puntos(userID, puntos) {
    let signo = puntos.charAt(0);
    let numero = Number(puntos.slice(1, puntos.length));
    if (signo == '+') {
        await profileModel.findOneAndUpdate({
            userID: userID
        },
            {
                $inc: {
                    udyrcoins: numero
                }
            })
    } else {
        await profileModel.findOneAndUpdate({
            userID: userID
        },
            {
                $inc: {
                    udyrcoins: -numero
                }
            })
    }
}