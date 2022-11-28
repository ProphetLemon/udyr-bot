const { Client, Message, Discord } = require("discord.js");
require('dotenv').config();
const profileModel = require('../../models/profileSchema');
const diaModel = require('../../models/diaSchema');
var ultimoSaludo
/**
 * 
 * @param {Discord} Discord
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (Discord, client, message) => {
    const prefix = process.env.PREFIX + " ";
    if (message.author.bot || message.channel.id == "953974289919520778") return;
    if (message.author.id == focusID) {
        message.member.send("Callate maric\u00F3n");
        message.delete();
    }
    //felicitarDia(message)
    let profileData;
    /*try {
        profileData = await profileModel.findOne({ userID: message.author.id, serverID: message.guild ? message.guild.id : "598896817157046281" });
        if (profileData) { return;
            return;
            if ((profileData.nivel + 1) % 100 == 0) {
                message.channel.send(`Has subido de nivel!\nAhora sos level ${(profileData.nivel + 1) / 100}`)
            }
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild ? message.guild.id : "598896817157046281"
            }, {
                $inc: {
                    nivel: 1
                }
            })
        }
    } catch (err) {
        console.log(err);
    }*/
    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd.toLocaleLowerCase()) || client.commands.find(a => a.aliases && a.aliases.includes(cmd.toLocaleLowerCase()));
    if (command && message.content.toLowerCase().startsWith(prefix)) {
        command.execute(message, args, cmd, client, Discord, profileData);
    } else if (message.content.toLowerCase().startsWith(prefix)) {
        metodosUtiles.insultar(message);
    } else {
        ruleta(message);
    }
}

/**
 * 
 * @param {Message} message 
 */
async function felicitarDia(message) {
    if (!message.guild || message.guild.id != "598896817157046281") {
        return
    }
    var hoy = new Date()
    if (ultimoSaludo == undefined) {
        var diaServer = await diaModel.findOne({
            serverID: "598896817157046281"
        })
        ultimoSaludo = diaServer.dia
    }
    if (metodosUtiles.formatDate(ultimoSaludo) == metodosUtiles.formatDate(hoy)) {
        return
    } else {
        ultimoSaludo = hoy
        await diaModel.findOneAndUpdate({
            serverID: message.guild.id
        }, {
            $set: {
                dia: hoy
            }
        })
        var hora = hoy.getHours()
        if (hora >= 21 || hora < 5) {
            message.channel.send("Primero de todo, buenas noches <:bloodtrail:979874011632779355>")
        } else if (hora >= 5 && hora < 13) {
            message.channel.send("Primero de todo, buenos dias <:bloodtrail:979874011632779355>")
        } else if (hora >= 13 && hora < 21) {
            message.channel.send("Primero de todo, buenos tardes <:bloodtrail:979874011632779355>")
        }
    }
}

/**
 * 
 * @param {Message} message 
 * @returns 
 */
function ruleta(message) {
    if (message.content.charAt(message.content.length - 1) == '5' || message.content.slice(message.content.length - 5, message.content.length).trim() == "cinco") {
        message.reply("por el culo te la hinco, maric\u00F3n");
        return;
    }
    if (message.content.trim().toLowerCase().includes("vaporeon")) {
        return message.channel.send("Hola chicos, ¿sabíais que en lo que respecta a la cría de Pokémon machos y hembras, Vaporeon es el Pokémon más compatible para los humanos?" +
            " No sólo pertenecen al grupo de los huevos de campo, que se compone principalmente de mamíferos, sino que Vaporeon mide una media de 1 m y pesa" +
            " 29 kg, lo que significa que son lo suficientemente grandes como para poder manejar pollas humanas, y con sus impresionantes estadísticas " +
            "base de PS y el acceso a Armadura Ácida, puedes ser duro con uno. Debido a su biología basada principalmente en el agua," +
            " no me cabe duda de que un Vaporeon excitado estaría increíblemente húmedo, tanto que podrías tener sexo con uno durante" +
            " horas sin que te doliera. Además, pueden aprender los movimientos Atracción, Ojitos Tiernos, Cautivar, Encanto y Látigo," +
            " y no tienen pelaje para ocultar los pezones, por lo que sería increíblemente fácil que uno te pusiera palote. Con sus" +
            " habilidades Absorbe Agua e Hidratación, pueden recuperarse fácilmente de la fatiga con suficiente agua. Ningún otro " +
            "Pokémon se acerca a este nivel de compatibilidad. Además, como dato curioso, si le das lo suficiente, " +
            "puedes hacer que tu Vaporeon se vuelva blanco. Vaporeon está literalmente hecho para la polla humana." +
            " Una estadística de defensa insana + un alto nivel de PS + el ataque Armadura Ácida significa que" +
            " puede aguantar pollas todo el día, de todas las formas y tamaños, y seguir queriendo más.")
    }
    var condiciones = ["tamaño", "grande", "pequeño", "estandar", "normalito"]
    var test = condiciones.some(el => message.content.trim().toLowerCase().includes(el))
    if (test) {
        return message.channel.send({
            content: "Oye ya que hablamos sobre tamaños que os parece de tamaño?\nOsea normal tirando a tamaño medio no?la mano es grande sabes?Xd", files: [{
                attachment: "./images/estandar.jpg",
                name: 'estandar.jpg'
            }]
        })
    }
    if (message.content.trim().toLowerCase() == "a" || message.content.trim().toLowerCase() == "ª") {
        message.channel.send("https://c.tenor.com/K_fk1dEUTzcAAAAC/mister-jagger-a.gif")
        return
    }
    if (message.content.trim().toLowerCase().includes("vikingos")) {
        message.channel.send({
            files: [{
                attachment: "./images/vikingos.gif",
                name: 'file.png'
            }]
        })
        return;
    }
    var ruleta = Math.floor(Math.random() * 20);
    console.log(ruleta);
    if (ruleta == 5) { //por el culo te la hinco jaja
        metodosUtiles.insultar(message);
    }
}