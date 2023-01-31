const { Message } = require("discord.js");

class campeon {
    /**
     * Campeon del lol
     * @param {string} nombre Nombre del campeon
     * @param {string[]} linea L�nea del campeon
     */
    constructor(nombre, linea) {
        this.nombre = nombre;
        this.linea = linea;
    }
}
const LINEAS = ["top", "jungla", "mid", "adc", "supp", "autofill", "random", "equipo", "jung", "jng"];
module.exports = {
    name: 'top',
    aliases: LINEAS,
    description: 'Funcion para crear apuestas o apostar en ellas',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO LINEAS_LOL");
        if (cmd == "equipo") {
            if (message.member && message.member.voice.channel) {
                var members = message.member.voice.channel.members

                var cont = [0, 1, 2, 3, 4]
                let shuffleArray = function (array) {
                    let currentIndex = array.length, randomIndex;
                    // While there remain elements to shuffle.
                    while (currentIndex != 0) {
                        // Pick a remaining element.
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex--;
                        // And swap it with the current element.
                        [array[currentIndex], array[randomIndex]] = [
                            array[randomIndex], array[currentIndex]];
                    }
                    return array;
                }
                cont = shuffleArray(cont)
                var listado = []
                for (let [id, member] of members) {
                    if (member.user.bot) {
                        continue;
                    }
                    if (cont.length == 0) {
                        return
                    }
                    let numero = cont.splice(0, 1)
                    let linea = LINEAS[numero]
                    var champ = champ_linea(linea)
                    listado.push(`${numero}- <@${member.id}> le toca jugar ${champ.nombre} en ${linea}\n`)
                }
                listado.sort(function (a, b) {
                    return a > b ? 1 : -1
                })
                for (let i = 0; i < listado.length; i++) {
                    listado[i] = listado[i].split("-")[1]
                }
                message.channel.send(listado.join(""))
            } else {
                message.channel.send("Tienes que estar en un chat de voz, maricón").then(msg => {
                    message.delete()
                    setTimeout(() => {
                        msg.delete()
                        console.log("FIN LINEAS_LOL");
                    }, 5000);
                })
            }
        } else {
            return message.reply(champ_linea(cmd, message).nombre).then(msg => {
                console.log("FIN LINEAS_LOL");
            })
        }

    }
}

/**
 * 
 * @param {string} cmd 
 * @returns {campeon}
 */
function champ_linea(cmd) {
    var linea = ""
    switch (cmd) {
        case "top":
            linea = LINEAS[0]
            break;
        case "jungla":
        case "jung":
        case "jng":
            linea = LINEAS[1]
            break;
        case "mid":
            linea = LINEAS[2]
            break;
        case "adc":
            linea = LINEAS[3]
            break;
        case "supp":
            linea = LINEAS[4]
            break;
    }
    var champs = []
    for (let i = 0; i < campeones.length; i++) {
        var campeon = campeones[i]
        if (campeon.linea.includes(linea)) {
            champs.push(campeon)
        }
    }
    return champs[Math.floor(Math.random() * champs.length)]
}

var campeones = [new campeon("Aatrox", [LINEAS[0]]),
new campeon("Ahri", [LINEAS[2]]),
new campeon("Akali", [LINEAS[2], LINEAS[0]]),
new campeon("Akshan", [LINEAS[2]]),
new campeon("Alistar", [LINEAS[4]]),
new campeon("Amumu", [LINEAS[4]]),
new campeon("Anivia", [LINEAS[2]]),
new campeon("Annie", [LINEAS[2]]),
new campeon("Aphelios", [LINEAS[3]]),
new campeon("Ashe", [LINEAS[3], LINEAS[4]]),
new campeon("Aurelion Sol", [LINEAS[2]]),
new campeon("Azir", [LINEAS[2]]),
new campeon("Bardo", [LINEAS[4]]),
new campeon("Bel'Veth", [LINEAS[1]]),
new campeon("Blitzcrank", [LINEAS[4]]),
new campeon("Brand", [LINEAS[4]]),
new campeon("Braum", [LINEAS[4]]),
new campeon("Caitlyn", [LINEAS[3]]),
new campeon("Camille", [LINEAS[0]]),
new campeon("Cassiopeia", [LINEAS[2]]),
new campeon("Cho'Gath", [LINEAS[0]]),
new campeon("Corki", [LINEAS[2]]),
new campeon("Darius", [LINEAS[0]]),
new campeon("Diana", [LINEAS[1]]),
new campeon("Draven", [LINEAS[3]]),
new campeon("Dr. Mundo", [LINEAS[0]]),
new campeon("Ekko", [LINEAS[2], LINEAS[1]]),
new campeon("Elise", [LINEAS[1]]),
new campeon("Evelynn", [LINEAS[1]]),
new campeon("Ezreal", [LINEAS[3]]),
new campeon("Fiddlesticks", [LINEAS[1]]),
new campeon("Fiora", [LINEAS[0]]),
new campeon("Fizz", [LINEAS[2]]),
new campeon("Galio", [LINEAS[2]]),
new campeon("Gangplank", [LINEAS[0]]),
new campeon("Garen", [LINEAS[0]]),
new campeon("Gnar", [LINEAS[0]]),
new campeon("Gragas", [LINEAS[0]]),
new campeon("Graves", [LINEAS[1]]),
new campeon("Gwen", [LINEAS[0]]),
new campeon("Hecarim", [LINEAS[1]]),
new campeon("Heimerdinger", [LINEAS[4]]),
new campeon("Illaoi", [LINEAS[0]]),
new campeon("Irelia", [LINEAS[0], LINEAS[2]]),
new campeon("Ivern", [LINEAS[1]]),
new campeon("Janna", [LINEAS[4]]),
new campeon("Jarvan IV", [LINEAS[1]]),
new campeon("Jax", [LINEAS[0]]),
new campeon("Jayce", [LINEAS[0]]),
new campeon("Jhin", LINEAS[3]),
new campeon("Jinx", [LINEAS[3]]),
new campeon("K'Sante", [LINEAS[0]]),
new campeon("Kai'Sa", [LINEAS[3]]),
new campeon("Kalista", [LINEAS[3]]),
new campeon("Karma", [LINEAS[4]]),
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
new campeon("Malphite", [LINEAS[0]]),
new campeon("Malzahar", [LINEAS[2]]),
new campeon("Maokai", [LINEAS[4]]),
new campeon("Miss Fortune", [LINEAS[3]]),
new campeon("Mordekaiser", [LINEAS[0], LINEAS[1]]),
new campeon("Morgana", [LINEAS[4]]),
new campeon("Nami", [LINEAS[4]]),
new campeon("Nasus", [LINEAS[0]]),
new campeon("Nautilus", [LINEAS[4]]),
new campeon("Neeko", [LINEAS[2]]),
new campeon("Nidalee", [LINEAS[1]]),
new campeon("Nilah", LINEAS[3]),
new campeon("Nocturne", [LINEAS[1]]),
new campeon("Nunu y Willump", [LINEAS[1]]),
new campeon("Olaf", [LINEAS[0]]),
new campeon("Orianna", [LINEAS[2]]),
new campeon("Ornn", [LINEAS[0]]),
new campeon("Pantheon", [LINEAS[4]]),
new campeon("Poppy", [LINEAS[1]]),
new campeon("Pyke", [LINEAS[4]]),
new campeon("Qiyana", [LINEAS[2]]),
new campeon("Quinn", [LINEAS[0]]),
new campeon("Rakan", [LINEAS[4]]),
new campeon("Rammus", [LINEAS[1]]),
new campeon("Rek'Sai", [LINEAS[1]]),
new campeon("Rell", [LINEAS[4]]),
new campeon("Renata Glasc", [LINEAS[4]]),
new campeon("Renekton", [LINEAS[0]]),
new campeon("Rengar", [LINEAS[1]]),
new campeon("Riven", [LINEAS[0]]),
new campeon("Rumble", [LINEAS[0], LINEAS[2]]),
new campeon("Ryze", [LINEAS[2]]),
new campeon("Samira", [LINEAS[3]]),
new campeon("Sejuani", [LINEAS[1]]),
new campeon("Senna", [LINEAS[4]]),
new campeon("Seraphine", [LINEAS[4]]),
new campeon("Sett", [LINEAS[0]]),
new campeon("Shaco", [LINEAS[1]]),
new campeon("Shen", [LINEAS[0]]),
new campeon("Shyvana", [LINEAS[1]]),
new campeon("Singed", [LINEAS[0]]),
new campeon("Sion", [LINEAS[0]]),
new campeon("Sivir", [LINEAS[3]]),
new campeon("Skarner", [LINEAS[1]]),
new campeon("Sona", [LINEAS[4]]),
new campeon("Soraka", [LINEAS[4]]),
new campeon("Swain", [LINEAS[2], LINEAS[4]]),
new campeon("Sylas", [LINEAS[1], LINEAS[2]]),
new campeon("Syndra", [LINEAS[2]]),
new campeon("Tahm Kench", [LINEAS[0]]),
new campeon("Taliyah", [LINEAS[1], LINEAS[2]]),
new campeon("Talon", [LINEAS[2]]),
new campeon("Taric", [LINEAS[4]]),
new campeon("Teemo", [LINEAS[0]]),
new campeon("Thresh", [LINEAS[4]]),
new campeon("Tristana", [LINEAS[3]]),
new campeon("Trundle", [LINEAS[1]]),
new campeon("Tryndamere", [LINEAS[0]]),
new campeon("Twisted Fate", [LINEAS[2]]),
new campeon("Twitch", [LINEAS[3]]),
new campeon("Udyr", [LINEAS[1]]),
new campeon("Urgot", [LINEAS[0]]),
new campeon("Varus", [LINEAS[2], LINEAS[3]]),
new campeon("Vayne", [LINEAS[3]]),
new campeon("Veigar", [LINEAS[2]]),
new campeon("Vel'Koz", [LINEAS[4]]),
new campeon("Vex", [LINEAS[2]]),
new campeon("Vi", [LINEAS[1]]),
new campeon("Viego", [LINEAS[1]]),
new campeon("Viktor", [LINEAS[2]]),
new campeon("Vladimir", [LINEAS[2]]),
new campeon("Volibear", [LINEAS[0], LINEAS[1]]),
new campeon("Warwick", [LINEAS[1]]),
new campeon("Wukong", [LINEAS[1]]),
new campeon("Xayah", [LINEAS[3]]),
new campeon("Xerath", [LINEAS[4]]),
new campeon("Xin Zhao", [LINEAS[1]]),
new campeon("Yasuo", [LINEAS[0], LINEAS[2]]),
new campeon("Yone", [LINEAS[0], LINEAS[2]]),
new campeon("Yorick", [LINEAS[0]]),
new campeon("Yuumi", [LINEAS[4]]),
new campeon("Zac", [LINEAS[1]]),
new campeon("Zed", [LINEAS[1], LINEAS[2]]),
new campeon("Zeri", [LINEAS[3]]),
new campeon("Ziggs", [LINEAS[2]]),
new campeon("Zilean", [LINEAS[4]]),
new campeon("Zoe", [LINEAS[2]]),
new campeon("Zyra", [LINEAS[4]])
];