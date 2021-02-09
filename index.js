const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const prefix = "udyr";
client.login(config.BOT_TOKEN);

client.on("ready", () => {
    client.user.setPresence({
        status: "dnd",
        activity: {
            name: 'el onlyfans de la berri',
            type: "WATCHING"
            /**,
            url: 'https://www.twitch.tv/monstercat'**/
        }
    })
    init_campeones();
    console.log("El bot ta ready");
});


client.on("message", function (message) {
    if (message.author.bot || (message.channel.id != "598896817161240663" && message.channel.id !="808421701662146570")) {
        return;
    }
    if (message.content.trim() == "udyr") {
        insultar(message);
        return;
    }
    if (message.content.startsWith(prefix)) {
       
        var args = message.content.slice(prefix.length).split(/ +/);
        var command = args[1].toString();
        command = command.toLowerCase();
        if (command == "hacienda" && isValidNumber(args[2])) {
            message.channel.send(calcular_tramo(args[2]))
        } else if (LINEAS.includes(command)) {
            elegir_campeon(command, message);
        } else {
            insultar(message);
        }
    } else {
        ruleta(message);
    }

});

// ------------------------------------- INICIO CAMPEON LOL -------------------------------------

const LINEAS = ["top", "jungla", "mid", "adc", "supp","autofill"];

/**
 * 
 * @param {string} nombre Nombre del campeon
 * @param {any} linea linea o lineas del campeon
 */
var campeon = function (nombre, linea) {
    this.nombre = nombre;
    this.linea = linea;
}

/**
 * Método que te dice un campeon en funcion de la linea que metas
 * @param {string} linea linea del champ
 * @param {Discord.Message} message Mensaje original
 */
function elegir_campeon(linea, message) {
    var campeon_linea = [];
    if (linea != LINEAS[5]) {
        for (var i = 0; i < campeones.length; i++) {
            if (campeones[i].linea.includes(linea)) {
                campeon_linea.push(campeones[i]);
            }
        }
        var random = Math.floor(Math.random() * campeon_linea.length);
        message.reply("te toca jugar " + campeon_linea[random].nombre + " en " + linea);
    } else {
        var champ_random = campeones[Math.floor(Math.random() * campeones.length)];
        message.reply("te toca jugar " + champ_random +" en " + champ_random.linea[Math.floor(Math.random() * champ_random.linea.length)]);
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
    new campeon("Karthus", [LINEAS[1], LINEAS[3]]),
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
    new campeon("Neeko", [LINEAS[0], LINEAS[2], LINEAS[3], LINEAS[4]]),
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
    new campeon("Seraphine", [LINEAS[2], LINEAS[3], LINEAS[4]]),
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
    new campeon("Syndra", [LINEAS[2]]),
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
    new campeon("Viego", [LINEAS[0], LINEAS[1], LINEAS[2]]),
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

//------------------------------------- FIN METODOS UTIL -------------------------------------