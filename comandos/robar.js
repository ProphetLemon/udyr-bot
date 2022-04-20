const { Message, Client } = require('discord.js');
const profileModel = require('../models/profileSchema');
const roboModel = require('../models/roboSchema');
const math = require('mathjs');
global.listaRobos = new Map()
module.exports = {
    name: 'robar',
    aliases: [],
    description: 'Funcion para robar a alguien',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        if (message.channel.id != "809786674875334677") {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("Bien intentado hijo de puta ahora intenta robar en el canal de udyr a ver si hay huevos.")
        }
        if (!profileData) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("No tas inscrito en la Liga Udyr, maric\u00F3n. Haz un 'udyr puntos' antes")
        }
        var hoy = moment().toDate()
        if (profileData.robar && profileData.robar.getDate() == hoy.getDate()) {
            message.member.send("Ya has robado cabron").then(msg => {
                setTimeout(() => {
                    msg.delete()
                }, 10000);
            })
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.delete()
        }
        if (hoy.getHours() < 12) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.channel.send("Solo se puede robar de 12:00 - 23:59")
        }
        var porcentaje = Math.floor(Math.random() * 11) + 15
        var personas = await profileModel.find({
            serverID: message.guild.id
        });
        personas.sort(function (a, b) {
            return b.udyrcoins - a.udyrcoins;
        });
        var i = 6
        do {
            i = i - 1
            var dineros = []
            personas = personas.slice(0, i)
            for (let i = 0; i < personas.length; i++) {
                dineros.push(personas[i].udyrcoins)
            }
            var sd = math.std(dineros)
        } while (sd > 200 && personas.length > 1)
        if (personas.length == 1 && personas[0].userID == message.author.id) {
            personas = await profileModel.find({
                serverID: message.guild.id
            });
            personas.sort(function (a, b) {
                return b.udyrcoins - a.udyrcoins;
            });
            personas = personas.slice(0, 3)
        }
        do {
            var personaElegida = personas[Math.floor(Math.random() * personas.length)]
        } while (personaElegida.userID == message.member.id)
        var guildMembers = await message.guild.members.fetch()
        var personaElegidaMember = guildMembers.get(personaElegida.userID)
        var personaRobada = await profileModel.findOne({
            serverID: message.guild.id,
            userID: personaElegidaMember.id
        });
        var monedasRobadas = Math.floor((personaRobada.udyrcoins * porcentaje) / 100)
        message.channel.send("SE HA PRODUCIDO UN ROBO! :scream:")
        message.member.send(`Has robado hoy (${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() +
            1).padStart(2, '0')}) a ${personaElegidaMember.displayName} y se la ha robado ${monedasRobadas} <:udyrcoin:961729720104419408> (${porcentaje}%)`)
        personaElegidaMember.send(`Te han robado hoy (${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() +
            1).padStart(2, '0')}) ${monedasRobadas} <:udyrcoin:961729720104419408>\n Para recuperarlos tienes que usar el comando \"udyr juicio @culpable\" mencionando` +
            ` quien t\u00FA crees que es el culpable. Si aciertas se te devolver\u00E1 el dinero y se le har\u00E1 un castigo al ladr\u00F3n,` +
            ` si fallas se te cobrara un impuesto por hacer un juicio a un inocente y no podras recuperar el dinero`).catch((err) => {
                message.channel.send(`<@!${personaElegidaMember.id}>, te han robado hoy (${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() +
                    1).padStart(2, '0')}) ${monedasRobadas} <:udyrcoin:961729720104419408>\n Para recuperarlos tienes que usar el comando \"udyr juicio @culpable\" mencionando` +
                    ` quien t\u00FA crees que es el culpable. Si aciertas se te devolver\u00E1 el dinero y se le har\u00E1 un castigo al ladr\u00F3n,` +
                    ` si fallas se te cobrara un impuesto por hacer un juicio a un inocente y no podras recuperar el dinero.`)
            })
        let hurto = await roboModel.create({
            userIDLadron: message.member.id,
            userIDAfectado: personaElegidaMember.id,
            dinero: monedasRobadas
        })
        await hurto.save()
        await profileModel.findOneAndUpdate({
            userID: personaElegidaMember.id,
            serverID: message.guild.id
        }, {
            $inc: {
                udyrcoins: -monedasRobadas
            }
        })
        await profileModel.findOneAndUpdate({
            userID: message.member.id,
            serverID: message.guild.id
        }, {
            $set: {
                robar: hoy
            }
        })
        var timeout = setTimeout(async (mensaje, hurto) => {
            message.channel.send(`Han pasado 12 horas asi que <@!${hurto.userIDLadron}> ha robado ${hurto.dinero} <:udyrcoin:961729720104419408> a <@!${hurto.userIDAfectado}>`)
            listaRobos.delete(mensaje.member.id)
            await profileModel.findOneAndUpdate({
                userID: mensaje.member.id,
                serverID: mensaje.guild.id
            }, {
                $inc: {
                    udyrcoins: hurto.dinero
                }
            })
            await roboModel.findOneAndRemove({
                userIDLadron: hurto.userIDLadron
            })
        }, 43_200_000, message, hurto);
        listaRobos.set(message.member.id, timeout)
        message.delete()
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}