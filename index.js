const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const prefix = "udyr";
client.login(config.BOT_TOKEN);

client.on("ready", () => {
    client.user.setPresence({
        status: "dnd",
        activity: {
            name: 'al beti',
            type: "WATCHING"
        }
    })
    init_campeones();
    console.log("El bot ta ready");
});

var canales_de_texto = ["598896817161240663", "809786674875334677"];

client.on("message", function (message) {
    if (message.author.bot || (!canales_de_texto.includes(message.channel.id))) {
        return;
    }
    if (message.content.trim() == "udyr") {
        insultar(message);
        return;
    }
    if (message.content.startsWith(prefix) && message.content.charAt(4) == ' ') {

        var args = message.content.slice(prefix.length).split(/ +/);
        var command = args[1].toString();
        command = command.toLowerCase();
        if (command == "hacienda" && isValidNumber(args[2])) {
            message.channel.send(calcular_tramo(args[2]))
        } else if (LINEAS.includes(command)) {
            elegir_campeon(command, message);
        } else if (command == "dado") {
            dado(message, args.slice(2, args.length));
        } else if (command == "moneda") {
            moneda(message);
        } else if (command == "estado") {
            cambiar_estado(message, args.slice(2, args.length));
        } else if (command == "puntos") {
            puntos(message);
        } else if (command == "apuesta") {
            crear_apuesta(message);
        } else if (command == "apostar") {
            apostar(message);
        } else if (command == "cerrar") {
            cerrar_apuesta(message);
        } else if (command == "donar") {
            donar(message);
        } else if (command == "alarma") {
            alarma(message)
        } else if (command == "ajustar") {
            ajustar(message);
        } else if (command == "ranking") {
            ranking(message);
        } else {
            insultar(message); 
        }
    } else {
        ruleta(message);
    }

});

// ------------------------------------- INCIO RANKING PUNTOS -------------------------------------

/**
 * 
 * @param {Discord.Message} message
 */
function ranking(message) {
    personas.sort(function (a, b) {
        return b.puntos-a.puntos;
    });
    var mensaje = "";
    for (let i = 0; i < personas.length; i++) {
        let competidor = personas[i];
        if (i == personas.length - 1) {
            mensaje += (i + 1) + " - <@!" + competidor.userID + "> con " + competidor.puntos;
        }
        else {
            mensaje += (i + 1) + " - <@!" + competidor.userID + "> con " + competidor.puntos + "\n";
        }
    }
    message.channel.send(mensaje);
}



// ------------------------------------- FIN RANKING PUNTOS -------------------------------------

// ------------------------------------- INICIO AJUSTAR HORA -------------------------------------

let horasDiferencia = 0;

/**
 * 
 * 
 * @param {Discord.Message} message
 */
function ajustar(message) {
    let hora = message.content.split(/ +/)[2];
    if (!isValidNumber(hora)) {
        insultar(message);
        return;
    }
    let dtServer = new Date();
    let dtCliente = new Date();
    dtCliente.setHours(hora);
    horasDiferencia = dtServer.getHours() - dtCliente.getHours();
    message.channel.send("La diferencia de horas es de " + horasDiferencia);
}

// ------------------------------------- FIN    AJUSTAR HORA -------------------------------------

// ------------------------------------- INICIO ALARMA -------------------------------------

/**
 * Configurando una alarma
 * @param {Discord.Message} message
 */
function alarma(message) {
    let args = message.content.split(/ +/)
    let dia =  args[2];
    let hora = args[3];
    let motivo = args[4];
    let dtAlarm = new Date();
    var regexDia = /\d{2}\/\d{2}/g;
    var regexHora = /\d{2}\:\d{2}/g;
    if ((!regexHora.test(hora))||(dia != "hoy" && dia != "mañana" && !regexDia.test(dia))) {
        insultar(message);
        return;
    }
    if (regexDia.test(dia)) {
        let mes = Number(dia.split("/")[1]) + 1;
        dia = Number(dia.split("/")[0]);
        dtAlarm.setMonth(mes)
        dtAlarm.setDate(dia);
    } else if (dia == "mañana") {
        dtAlarm.setDate(dtAlarm.getDate()+1);
    }
    let horas = Number(hora.split(":")[0]);
    let minutos = Number(hora.split(":")[1]);
    dtAlarm.setMinutes(minutos);
    dtAlarm.setHours(horas);
    dtAlarm.setSeconds(0);
    let dtNow = new Date();
    dtNow.setHours(dtNow.getHours() - horasDiferencia);
    if (dtAlarm - dtNow <= 0) {
        insultar(message);
        return;
    }
    let diff = dtAlarm - dtNow;
    setTimeout(function () { message.reply("Oye, te recuerdo esto : " + motivo); }, diff);
    message.reply("Se ha creado la alarma correctamente!");
}

// ------------------------------------- FIN ALARMA -------------------------------------

// ------------------------------------- INICIO DONAR UDYR COINS -------------------------------------

/**
 * Regalar udyr coins para cuando ha y un reset
 * @param {Discord.Message} message mensaje
 */
function donar(message) {
    var mencion = message.content.split(/ +/)[2];
    if (!isMention(mencion)) {
        insultar(message);
        return;
    }
    if (message.author.id != "202065665597636609") {
        insultar(message);
        return;
    }
    var puntos = Number(message.content.split(/ +/)[3]);
    var userID = mencion.slice(3, mencion.length - 1);
    for (let i = 0; i < personas.length; i++) {
        if (personas[i].userID == userID) {
            personas[i].puntos += puntos;
            message.reply("has dado " + puntos + " udyr coins al mendigo de <@!" + userID+">");
            return;
        }
    }    
    personas.push(new persona(new Date(), (1000 + puntos), userID));
    message.reply("has dado " + puntos + " udyr coins al mendigo de <@!" + userID + ">");
    setTimeout(function(){ message.channel.bulkDelete(2) },2000);
}

// ------------------------------------- FIN DONAR UDYR COINS -------------------------------------

// ------------------------------------- INICIO PUNTOS Y APUESTAS -------------------------------------

class persona {
    /**
     * Constructor de clase persona
     * @param {Date} dia
     * @param {number} puntos
     * @param {string} userID
     */
    constructor(dia, puntos, userID) {
        this.dia = dia;
        this.puntos = puntos;
        this.userID = userID;
    }
}


var personas = [];

/**
 * Funcion para reclamar puntos diarios
 * @param {Discord.Message} message Mensaje original
 */
function puntos(message) {
    var existe = false;
    var posicion = 0;
    for (var i = 0; i < personas.length; i++) {
        if (personas[i].userID == message.author.id) {
            existe = true;
            posicion = i;
            break;
        }
    }
    if (!existe) {
        var puntos_random = Math.floor(Math.random() * 30) + 21;
        personas.push(new persona(new Date(), (1000 + puntos_random), message.author.id));
        message.reply("\u00A1Has canjeado la recompensa diaria, has ganado " + puntos_random + " udyr coins!\nTienes " + (1000 + puntos_random) + " udyr coins.");
    }
    else {
        var autor = personas[posicion];
        if (isSameDay(autor.dia, new Date())) {
            message.reply("tienes " + autor.puntos + " udyr coins");
        }
        else {
            var puntos_random = Math.floor(Math.random() * 31) + 20;
            autor.puntos += puntos_random;
            message.reply("\u00A1Has canjeado la recompensa diaria, has ganado " + puntos_random + " udyr coins!\nTienes " + autor.puntos + " udyr coins.");
            personas[posicion] = autor;
        }
    }
}

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

/**
 * Crear apuesta
 * @param {Discord.Message} message mensaje original
 */
function crear_apuesta(message) {
    if (apuesta_actual.nombre != undefined) {
        message.channel.send("Ya existe una apuesta activa (" + apuesta_actual.nombre + "), cierrala para poder crear otra");
        return;
    }
    let args = message.content.split("\"");
    nombre_bandos.push(args[3]);
    nombre_bandos.push(args[5]);
    apuesta_actual = new apuesta(args[1], message.author.id, []);
    message.channel.send("Se ha creado la apuesta \"" + apuesta_actual.nombre + "\"");
}

/**
 * Apostar a un bando
 * @param {Discord.Message} message
 */
function apostar(message) {
    if (apuesta_actual.nombre == undefined) {
        message.reply("No existe una apuesta activa, maric\u00F3n");
        return;
    }

    let nombre = message.author.id;
    let bando = message.content.split("\"")[1];
    if (!nombre_bandos.includes(bando)) {
        insultar(message);
        return;
    }
    let puntos = Number(message.content.split("\"")[2]);
    if (comprobar_puntos(nombre) == 0) {
        message.reply("No tienes puntos, canjealos con el comando 'udyr puntos'");
        return;
    } else if (comprobar_puntos(nombre) < puntos) {
        message.reply("Ya te molaria tener esos puntos maric\u00F3n");
        return;
    }
    let existe = false;
    for (let i = 0; i < apuesta_actual.apostadores.length; i++) {
        if (apuesta_actual.apostadores[i].userID == message.author.id) {
            existe = true;
            if (apuesta_actual.apostadores[i].bando != bando) {
                insultar(message);
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

}

/**
 *  Cerrar apuesta
 * @param {Discord.Message} message Mensaje original
 */
function cerrar_apuesta(message) {
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
            message.channel.send(message.guild.members.cache.get(apuesta_actual.apostadores[i].userID).displayName + " ha ganado " + puntos + " udyr coins (" + comprobar_puntos(apuesta_actual.apostadores[i].userID) + " en total)");
        }
    }
    apuesta_actual = new apuesta(undefined, undefined, undefined);
    nombre_bandos = [];
}

/**
 * Metodo para sumar o restar puntos
 * @param {string} userID
 * @param {string} puntos
 */
function cambiar_puntos(userID, puntos) {
    let signo = puntos.charAt(0);
    let numero = Number(puntos.slice(1, puntos.length));
    if (signo == '+') {
        for (let i = 0; i < personas.length; i++) {
            if (personas[i].userID == userID) {
                personas[i].puntos += numero;
            }
        }
    } else {
        for (let i = 0; i < personas.length; i++) {
            if (personas[i].userID == userID) {
                personas[i].puntos -= numero;
            }
        }
    }
}

/**
 * Funcion que te devuelve los puntos de una persona
 * 
 * @param {string} userID
 */
function comprobar_puntos(userID) {
    for (let i = 0; i < personas.length; i++) {
        if (personas[i].userID == userID) {
            return personas[i].puntos;
        }
    }
    return 0;
}

// ------------------------------------- FIN PUNTOS Y APUESTAS -------------------------------------

// ------------------------------------- INICIO CAMBIO DE ESTADO -------------------------------------
/**
 * Funcion para cambiar el estado del bot
 * @param {Discord.Message} message Mensaje original
 * @param {string[]} args Argumentos
 */
function cambiar_estado(message, args) {
    var estado_personalizado = message.content.split("\"")[1];
    switch (args[0]) {
        case "ocupado":
            args[0] = "dnd";
            break;
        case "invisible":
            args[0] = "invisible";
            break;
        case "ausente":
            args[0] = "idle";
            break;
        case "online":
            args[0] = "online";
            break;
        default:
            insultar(message);
            return;
    }
    switch (args[1]) {
        case "viendo":
            args[1] = "WATCHING";
            break;
        case "escuchando":
            args[1] = "LISTENING";
            break;
        case "jugar":
            args[1] = "PLAYING";
            break;
        case "compitiendo":
            args[1] = "COMPETING";
            break;
        default:
            args[1] = "CUSTOM_STATUS";
    }
    client.user.setPresence({
        status: args[0],
        activity: {
            name: estado_personalizado,
            type: args[1]
        }
    })
}

// ------------------------------------- FIN CAMBIO DE ESTADO -------------------------------------

// ------------------------------------- INICIO MONEDA -------------------------------------

/**
 * Funcion que devuelve cara o cruz
 * @param {Discord.Message} message
 */
function moneda(message) {
    message.reply(Math.floor(Math.random() * 2) == 0 ? "cara" : "cruz");
}

// ------------------------------------- FIN MONEDA -------------------------------------

// ------------------------------------- INICIO DADO -------------------------------------

/**
 * Funcion que tira un dado en funcion del numero de caras del dado 
 * @param {Discord.Message} message mensaje original
 * @param {string[]} info numero de tiradas
 */
function dado(message, info) {
    var numero = info[0];
    var tiradas = info[1];
    if (numero == undefined) {
        numero = 6;
    }
    else {
        if (!isValidNumber(numero)) {
            insultar(message);
            return;
        }
    }
    if (tiradas == undefined) {
        tiradas = 1;
    }
    else {
        if (!isValidNumber(tiradas)) {
            insultar(message);
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

// ------------------------------------- FIN DADO -------------------------------------

// ------------------------------------- INICIO CAMPEON LOL -------------------------------------

const LINEAS = ["top", "jungla", "mid", "adc", "supp", "autofill", "random"];


class campeon {
    /**
     * Campeon del lol
     * @param {string} nombre Nombre del campeon
     * @param {string[]} linea Linea del campeon
     */
    constructor(nombre, linea) {
        this.nombre = nombre;
        this.linea = linea;
    }
}

/**
 * Método que te dice un campeon en funcion de la linea que metas
 * @param {string} linea linea del champ
 * @param {Discord.Message} message Mensaje original
 */
function elegir_campeon(linea, message) {
    var campeon_linea = [];
    if (linea == LINEAS[6]) {
        var linea_random = Math.floor(Math.random() * 5);
        message.reply("te toca jugar " + campeones[Math.floor(Math.random() * campeones.length)].nombre + " en " + LINEAS[linea_random]);
    } else if (linea == LINEAS[5]) {
        var champ_random = campeones[Math.floor(Math.random() * campeones.length)];
        message.reply("te toca jugar " + champ_random.nombre + " en " + champ_random.linea[Math.floor(Math.random() * champ_random.linea.length)]);
    } else {
        for (var i = 0; i < campeones.length; i++) {
            if (campeones[i].linea.includes(linea)) {
                campeon_linea.push(campeones[i]);
            }
        }
        var random = Math.floor(Math.random() * campeon_linea.length);
        message.reply("te toca jugar " + campeon_linea[random].nombre);
    }


}

var campeones = [];

/**
 * Método para iniciar los champs
 * */
function init_campeones() {
    campeones = [new campeon("Aatrox", [LINEAS[0]]),
    new campeon("Ahri", [LINEAS[2]]),
    new campeon("Akali", [LINEAS[2], LINEAS[0]]),
    new campeon("Alistar", [LINEAS[4]]),
    new campeon("Amumu", [LINEAS[1]]),
    new campeon("Anivia", [LINEAS[2]]),
    new campeon("Annie", [LINEAS[2], LINEAS[4]]),
    new campeon("Aphelios", [LINEAS[3]]),
    new campeon("Ashe", [LINEAS[3], LINEAS[4]]),
    new campeon("Aurelion Sol", [LINEAS[2]]),
    new campeon("Azir", [LINEAS[2]]),
    new campeon("Bardo", [LINEAS[4]]),
    new campeon("Blitzcrank", [LINEAS[4]]),
    new campeon("Brand", [LINEAS[2], LINEAS[4]]),
    new campeon("Braum", [LINEAS[4]]),
    new campeon("Caitlyn", [LINEAS[3]]),
    new campeon("Camille", [LINEAS[0], LINEAS[1]]),
    new campeon("Cassiopeia", [LINEAS[0], LINEAS[2], LINEAS[3]]),
    new campeon("Cho'Gath", [LINEAS[0], LINEAS[1], LINEAS[2]]),
    new campeon("Corki", [LINEAS[2]]),
    new campeon("Darius", [LINEAS[0]]),
    new campeon("Diana", [LINEAS[2], LINEAS[1]]),
    new campeon("Draven", [LINEAS[3]]),
    new campeon("Dr. Mundo", [LINEAS[0], LINEAS[1]]),
    new campeon("Ekko", [LINEAS[2], LINEAS[1]]),
    new campeon("Elise", [LINEAS[1]]),
    new campeon("Evelynn", [LINEAS[1]]),
    new campeon("Ezreal", [LINEAS[3]]),
    new campeon("Fiddlesticks", [LINEAS[1]]),
    new campeon("Fiora", [LINEAS[0]]),
    new campeon("Fizz", [LINEAS[2]]),
    new campeon("Galio", [LINEAS[2], LINEAS[4]]),
    new campeon("Gangplank", [LINEAS[0]]),
    new campeon("Garen", [LINEAS[0], LINEAS[1], LINEAS[2]]),
    new campeon("Gnar", [LINEAS[0]]),
    new campeon("Gragas", [LINEAS[0], LINEAS[1], LINEAS[4]]),
    new campeon("Graves", [LINEAS[1]]),
    new campeon("Hecarim", [LINEAS[1]]),
    new campeon("Heimerdinger", [LINEAS[0], LINEAS[2], LINEAS[3]]),
    new campeon("Illaoi", [LINEAS[0]]),
    new campeon("Irelia", [LINEAS[0], LINEAS[2]]),
    new campeon("Ivern", [LINEAS[1]]),
    new campeon("Janna", [LINEAS[4]]),
    new campeon("Jarvan IV", [LINEAS[1], LINEAS[4]]),
    new campeon("Jax", [LINEAS[0], LINEAS[1]]),
    new campeon("Jayce", [LINEAS[0], LINEAS[2]]),
    new campeon("Jhin", LINEAS[3]),
    new campeon("Jinx", [LINEAS[3]]),
    new campeon("Kai'Sa", [LINEAS[3]]),
    new campeon("Kalista", [LINEAS[3]]),
    new campeon("Karma", [LINEAS[0], LINEAS[4]]),
    new campeon("Karthus", [LINEAS[1]]),
    new campeon("Kassadin", [LINEAS[2]]),
    new campeon("Katarina", [LINEAS[2]]),
    new campeon("Kayle", [LINEAS[0]]),
    new campeon("Kayn", [LINEAS[1]]),
    new campeon("Kennen", [LINEAS[0]]),
    new campeon("Kha'Zix", [LINEAS[1]]),
    new campeon("Kindred", [LINEAS[1]]),
    new campeon("Kled", [LINEAS[0]]),
    new campeon("Kog'Maw", [LINEAS[3]]),
    new campeon("LeBlanc", [LINEAS[2]]),
    new campeon("Lee Sin", [LINEAS[1]]),
    new campeon("Leona", [LINEAS[4]]),
    new campeon("Lillia", [LINEAS[1]]),
    new campeon("Lissandra", [LINEAS[2]]),
    new campeon("Lucian", [LINEAS[3]]),
    new campeon("Lulu", [LINEAS[4]]),
    new campeon("Lux", [LINEAS[2], LINEAS[4]]),
    new campeon("Maestro Yi", [LINEAS[1]]),
    new campeon("Malphite", [LINEAS[0], LINEAS[2], LINEAS[4]]),
    new campeon("Malzahar", [LINEAS[2]]),
    new campeon("Maokai", [LINEAS[0], LINEAS[4]]),
    new campeon("Miss Fortune", [LINEAS[3], LINEAS[4]]),
    new campeon("Mordekaiser", [LINEAS[0], LINEAS[2]]),
    new campeon("Morgana", [LINEAS[2], LINEAS[1], LINEAS[4]]),
    new campeon("Nami", [LINEAS[4]]),
    new campeon("Nasus", [LINEAS[1], LINEAS[0], LINEAS[2]]),
    new campeon("Nautilus", [LINEAS[4]]),
    new campeon("Neeko", [LINEAS[0], LINEAS[2], LINEAS[4]]),
    new campeon("Nidalee", [LINEAS[1], LINEAS[4]]),
    new campeon("Nocturne", [LINEAS[0], LINEAS[1], LINEAS[2]]),
    new campeon("Nunu y Willump", [LINEAS[1], LINEAS[2]]),
    new campeon("Olaf", [LINEAS[0], LINEAS[1]]),
    new campeon("Orianna", [LINEAS[2]]),
    new campeon("Ornn", [LINEAS[0]]),
    new campeon("Pantheon", [LINEAS[0], LINEAS[1], LINEAS[2], LINEAS[4]]),
    new campeon("Poppy", [LINEAS[0]]),
    new campeon("Pyke", [LINEAS[4]]),
    new campeon("Qiyana", [LINEAS[2]]),
    new campeon("Quinn", [LINEAS[0]]),
    new campeon("Rakan", [LINEAS[4]]),
    new campeon("Rammus", [LINEAS[1]]),
    new campeon("Rek'Sai", [LINEAS[1]]),
    new campeon("Rell", [LINEAS[4]]),
    new campeon("Renekton", [LINEAS[0]]),
    new campeon("Rengar", [LINEAS[0], LINEAS[1]]),
    new campeon("Riven", [LINEAS[0]]),
    new campeon("Rumble", [LINEAS[0], LINEAS[2]]),
    new campeon("Ryze", [LINEAS[0], LINEAS[2]]),
    new campeon("Samira", [LINEAS[3]]),
    new campeon("Sejuani", [LINEAS[1]]),
    new campeon("Senna", [LINEAS[3], LINEAS[4]]),
    new campeon("Seraphine", [LINEAS[2], LINEAS[4]]),
    new campeon("Sett", [LINEAS[0], LINEAS[1], LINEAS[2], LINEAS[4]]),
    new campeon("Shaco", [LINEAS[0], LINEAS[1], LINEAS[4]]),
    new campeon("Shen", [LINEAS[0], LINEAS[1], LINEAS[4]]),
    new campeon("Shyvana", [LINEAS[0], LINEAS[1]]),
    new campeon("Singed", [LINEAS[0]]),
    new campeon("Sion", [LINEAS[0], LINEAS[1], LINEAS[4]]),
    new campeon("Sivir", [LINEAS[3]]),
    new campeon("Skarner", [LINEAS[1]]),
    new campeon("Sona", [LINEAS[4]]),
    new campeon("Soraka", [LINEAS[0], LINEAS[4]]),
    new campeon("Swain", [LINEAS[0], LINEAS[2], LINEAS[3], LINEAS[4]]),
    new campeon("Sylas", [LINEAS[0], LINEAS[1], LINEAS[2]]),
    new campeon("Syndra", [LINEAS[2], LINEAS[3]]),
    new campeon("Tahm Kench", [LINEAS[0], LINEAS[4]]),
    new campeon("Taliyah", [LINEAS[1]]),
    new campeon("Talon", [LINEAS[1], LINEAS[2]]),
    new campeon("Taric", [LINEAS[4]]),
    new campeon("Teemo", [LINEAS[0], LINEAS[1], LINEAS[2], LINEAS[4]]),
    new campeon("Thresh", [LINEAS[4]]),
    new campeon("Tristana", [LINEAS[2], LINEAS[3]]),
    new campeon("Trundle", [LINEAS[0], LINEAS[1]]),
    new campeon("Tryndamere", [LINEAS[0], LINEAS[1]]),
    new campeon("Twisted Fate", [LINEAS[2]]),
    new campeon("Twitch", [LINEAS[1], LINEAS[3], LINEAS[4]]),
    new campeon("Udyr", [LINEAS[1]]),
    new campeon("Urgot", [LINEAS[0]]),
    new campeon("Varus", [LINEAS[3]]),
    new campeon("Vayne", [LINEAS[0], LINEAS[3]]),
    new campeon("Veigar", [LINEAS[2], LINEAS[4]]),
    new campeon("Vel'Koz", [LINEAS[2], LINEAS[4]]),
    new campeon("Vi", [LINEAS[1]]),
    new campeon("Viego", [LINEAS[0], LINEAS[1]]),
    new campeon("Viktor", [LINEAS[2]]),
    new campeon("Vladimir", [LINEAS[0], LINEAS[2]]),
    new campeon("Volibear", [LINEAS[0], LINEAS[1]]),
    new campeon("Warwick", [LINEAS[1]]),
    new campeon("Wukong", [LINEAS[0], LINEAS[1]]),
    new campeon("Xayah", [LINEAS[3]]),
    new campeon("Xerath", [LINEAS[2], LINEAS[4]]),
    new campeon("Xin Zhao", [LINEAS[1]]),
    new campeon("Yasuo", [LINEAS[0], LINEAS[2], LINEAS[3]]),
    new campeon("Yone", [LINEAS[0], LINEAS[2]]),
    new campeon("Yorick", [LINEAS[0]]),
    new campeon("Yuumi", [LINEAS[4]]),
    new campeon("Zac", [LINEAS[1]]),
    new campeon("Zed", [LINEAS[2]]),
    new campeon("Ziggs", [LINEAS[2]]),
    new campeon("Zilean", [LINEAS[4]]),
    new campeon("Zoe", [LINEAS[2]]),
    new campeon("Zyra", [LINEAS[4]])
    ];
}

//------------------------------------- FIN CAMPEON LOL -------------------------------------

// ------------------------------------- INICIO RULETA -------------------------------------

/**
 * Ruleta para ver si te toca un maravilloso insulto
 * @param {Discord.Message} message mensaje original
 */
function ruleta(message) {
    var ruleta = Math.floor(Math.random() * 10);
    console.log(ruleta);
    if (ruleta == 5) { //por el culo te la hinco jaja
        insultar(message);
    }
}

/**
 * Pues te toco que te insulten jaja
 * @param {Discord.Message} message mensaje original
 */
function insultar(message) {
    message.reply("maric\u00F3n");
}

// ------------------------------------- FIN RULETA -------------------------------------

// ------------------------------------- INICIO IRPF -------------------------------------

var tramo1 = (12_450 * 19) / 100;
var tramo2 = ((20_200 - 12_450) * 24) / 100;
var tramo3 = ((35_200 - 20_200) * 30) / 100;
var tramo4 = ((60_000 - 35_200) * 37) / 100;
var tramo5 = ((300_000 - 60_000) * 45) / 100;

/**
 * Calcula lo que te quita hacienda
 * @param {number} dinero
 */
function calcular_tramo(dinero) {
    var dinero_final = 0;
    var dinero_descontado = 0;
    if (dinero <= 12450) {
        dinero_descontado = (dinero * 19) / 100;
    } else if (dinero <= 20_200) {
        dinero_descontado = (((dinero - 12_450) * 24) / 100) + tramo1;
    } else if (dinero <= 35_200) {
        dinero_descontado = (((dinero - 20_200) * 30) / 100) + tramo1 + tramo2;
    } else if (dinero <= 60_000) {
        dinero_descontado = (((dinero - 35_200) * 37) / 100) + tramo1 + tramo2 + tramo3;
    } else if (dinero <= 300_000) {
        dinero_descontado = (((dinero - 60_000) * 45) / 100) + tramo1 + tramo2 + tramo3 + tramo4;
    } else if (dinero > 300_000) {
        dinero_descontado = (((dinero - 300_000) * 47) / 100) + tramo1 + tramo2 + tramo3 + tramo4 + tramo5;
    }
    dinero_final = dinero - dinero_descontado;
    var porcentaje_final = (dinero_final * 100) / dinero
    dinero = numberWithCommas((parseFloat(dinero).toFixed(2)));
    dinero_final = numberWithCommas((parseFloat(dinero_final).toFixed(2)));
    dinero_descontado = numberWithCommas((parseFloat(dinero_descontado).toFixed(2)));
    return "Dinero original: " + dinero + "\nDinero descontado: " + dinero_descontado + " (" + parseFloat(100 - porcentaje_final).toFixed(2) + "%)\nDinero final: " + dinero_final + " (" + parseFloat(porcentaje_final).toFixed(2) + "%)"
}

//------------------------------------- FIN IRPF -------------------------------------

//------------------------------------- INICIO METODOS UTIL -------------------------------------

/**
 * Te cambia el numero a uno formateado
 * @param {number} x numero a formatear
 */
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Compara dos objetos tipo Date para saber si es el mismo día o no
 * @param {Date} date1 dia 1
 * @param {Date} date2 dia 2
 */
function isSameDay(date1, date2) {
    var dd1 = String(date1.getDate()).padStart(2, '0');
    var mm1 = String(date1.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy1 = date1.getFullYear();

    var dd2 = String(date2.getDate()).padStart(2, '0');
    var mm2 = String(date2.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy2 = date2.getFullYear();

    return (dd1 == dd2 && mm1 == mm2 && yyyy1 == yyyy2);

}

/**
 * Metood que mira si es un numero valido
 * @param {string|number} aux numero a comprobar
 */
function isValidNumber(aux) {
    var numero = String(aux);
    var numeros = "1234567890"
    var isValid = false;
    for (var i = 0; i < numero.length; i++) {
        isValid = false;
        for (var j = 0; j < numeros.length; j++) {
            if (numero.charAt(i) == numeros.charAt(j)) {
                isValid = true;
                break;
            }
        }
        if (!isValid) {
            break;
        }
    }
    return isValid;
}

/**
 * 
 * @param {string} mention Posible mencion
 */
function isMention(mention) {
    let inicio = mention.slice(0, 3);
    let numero = mention.slice(3, mention.length - 1);
    let fin = mention.slice(mention.length - 1, mention.length);
    return inicio == "<@!" && isValidNumber(numero) && fin == ">";
}

//------------------------------------- FIN METODOS UTIL -------------------------------------