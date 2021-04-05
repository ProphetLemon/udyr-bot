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
const LINEAS = ["top", "jungla", "mid", "adc", "supp", "autofill", "random", "equipo"];
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
    async execute(message, args, cmd, client, Discord, profileData) {
        var linea = cmd;
        var campeon_linea = [];
        if (linea == LINEAS[7]) {
            if (message.mentions.users.size != 4) return message.channel.send("Tienes que mencionar a 4 personas").then(msg => msg.delete({ timeout: 3000 }));
            var guildMembers = await message.guild.members.fetch();
            var aux = message.mentions.users;
            var parguelas = [];
            parguelas.push(message.author);
            var mensaje = "";
            while (aux.size > 0) {
                let random = Math.floor(Math.random() * aux.size);
                let pibe = aux.array()[random];
                parguelas.push(pibe);
                aux.delete(pibe.id)
            }
            for (let i = 0; i < parguelas.length; i++) {
                linea = LINEAS[4-(4-i)];
                for (let j = 0; j < campeones.length; j++) {
                    if (campeones[j].linea.includes(linea)) {
                        campeon_linea.push(campeones[j]);
                    }
                }
                var random = Math.floor(Math.random() * campeon_linea.length);
                mensaje += `<@!${parguelas[i].id}> te toca jugar ${campeon_linea[random].nombre} en ${linea}\n`;
                campeon_linea=[];
            }
            message.channel.send(mensaje);
        } else if (linea == LINEAS[6]) {
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
}

var campeones = [new campeon("Aatrox", [LINEAS[0]]),
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