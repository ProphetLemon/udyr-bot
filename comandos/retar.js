const { Message } = require('discord.js');
const fs = require('fs');
const adminModel = require("../models/adminSchema");
const profileModel = require('../models/profileSchema');
class gladiador {
    /**
     * 
     * @param {string} nombre
     * @param {number} vida
     */
    constructor(nombre, vida) {
        this.nombre = nombre;
        this.vida = vida;
    }
}
class admin {
    /**
     * 
     * @param {string} nombre
     * @param {Date} dateLimite
     */
    constructor(nombre, dateLimite) {
        this.nombre = nombre;
        this.dateLimite = dateLimite;
    }
}
var logCombate = [];
var adminActual = new admin(undefined, undefined);
var jugarseElTitulo = false;
var banquillo = [];
var ganador;
var perdedor;
var sucedioEventoAmor = false;
var sucedioEventoUdyr = false;
var baseDmg = 30;
var parryDmg = baseDmg / 2;
var logCombate = [];
var turno = 2;
var eventosRandom = ["MATRIX", "UDYR", "AMOR"];
var puntos_peaje = 100;
module.exports = {
    name: 'retar',
    aliases: ['pelea', 'coliseo'],
    description: 'Funcion para retar a alguien',
    async execute(message, args, cmd, client, Discord, profileData) {
        if (logCombate.length > 0) {
            return;
        }
        if (adminActual.nombre == undefined) {
            var adminBBDD = await adminModel.find();
            var adminModelo = adminBBDD[0];
            var memberManager = await message.guild.members.fetch();
            var memberAdmin = memberManager.find(member => member.id == adminModelo.userID);
            adminActual = new admin(memberAdmin.displayName, adminModelo.endDate);
        }
        var personaje2 = "";
        var personaje1 = "";
        var gladiador1;
        var gladiador2;
        if (cmd == 'pelea') {
            var args = message.content.split("\"");
            var nombre1 = args[1];
            var nombre2 = args[3];
            if (nombre1 == undefined || nombre2 == undefined) {
                message.reply("eres tan maric\u00F3n que te heriste a ti mismo");
                return;
            }
            if (metodosUtiles.isMention(nombre1)) {
                nombre1 = message.guild.members.cache.get(metodosUtiles.returnIdFromMention(nombre1)).displayName;
            } else if (metodosUtiles.isRol(nombre1)) {
                metodosUtiles.insultar(message);
                return;
            }
            if (metodosUtiles.isMention(nombre2)) {
                nombre2 = message.guild.members.cache.get(metodosUtiles.returnIdFromMention(nombre2)).displayName;
            } else if (metodosUtiles.isRol(nombre2)) {
                metodosUtiles.insultar(message);
                return;
            }
            gladiador1 = new gladiador(nombre1, 100);
            gladiador2 = new gladiador(nombre2, 100);
        } else if (cmd == 'retar') {            
            personaje1 = message.guild.members.cache.get(message.author.id).displayName;
            var idpj2 = args[0];            
            if (idpj2 == undefined) {
                message.reply("eres tan maric\u00F3n que te heriste a ti mismo");
                return;
            }           
            personaje2 = "";
            if (metodosUtiles.isMention(idpj2)) {
                personaje2 = message.guild.members.cache.get(metodosUtiles.returnIdFromMention(idpj2)).displayName;
            } else if (metodosUtiles.isRol(idpj2)) {
                metodosUtiles.insultar(message);
                return;
            } else {
                message.reply("eres tan maric\u00F3n que te heriste a ti mismo");
                return;
            }            
            if (personaje1 == adminActual.nombre) {
                jugarseElTitulo = true;
            }else if (personaje2 == adminActual.nombre){
                if (profileData.udyrcoins<puntos_peaje)return message.reply("no tienes puntos ni para comprar pan gilipollas");
                message.channel.send(`${message.member.displayName} se esta jugando ${puntos_peaje} <:udyrcoin:825031865395445760>!`);
            }
            gladiador1 = new gladiador(personaje1, 100);
            gladiador2 = new gladiador(personaje2, 100);
        }
        else if (cmd == 'coliseo') {
            let guildMembers = await message.guild.members.fetch();
            let id1 = guildMembers.array()[Math.floor(Math.random() * guildMembers.array().length)].id;
            let id2 = guildMembers.array()[Math.floor(Math.random() * guildMembers.array().length)].id;
            message.channel.send("<@!" + id1 + "> vs <@!" + id2 + ">");
            var gladiador1 = new gladiador(guildMembers.get(id1).displayName, 100);
            var gladiador2 = new gladiador(guildMembers.get(id2).displayName, 100);

        }
        coliseo(gladiador1, gladiador2, message);
    }
}


async function coliseo(gladiador1, gladiador2, message) {    
    if ((banquillo.includes(gladiador1.nombre) || banquillo.includes(gladiador2.nombre)) && (gladiador1.nombre == adminActual.nombre || gladiador2.nombre == adminActual.nombre) && !jugarseElTitulo) {
        message.channel.send(banquillo.includes(gladiador1.nombre) ? (gladiador1.nombre + " ya intento enfrentarse al admin hace poco y no puede volver a hacerlo aun") : (gladiador2.nombre + " ya intento enfrentarse al admin hace poco y no puede volver a hacerlo aun"));
        return;
    }
    if (gladiador1.nombre == gladiador2.nombre) {
        message.reply("no te puedes retar a ti mismo, maric\u00F3n");
        return;
    }
    if ((gladiador1.nombre == adminActual.nombre || gladiador2.nombre == adminActual.nombre) && !jugarseElTitulo) {
        var dateNow = new Date();
        dateNow.setHours(dateNow.getHours() - horasDiferencia);
        if (dateNow < adminActual.dateLimite) {
            message.reply("no se puede retar al admin aun, podras retar al admin cuando sean las " + adminActual.dateLimite.getHours() + ":" + metodosUtiles.cambiarMinutos(adminActual.dateLimite));
            return;
        }
    }
    logCombate.push("Comienza el combate entre " + gladiador1.nombre + " y " + gladiador2.nombre + "!");
    messageCopy = message;
    var comienzo = Math.floor(Math.random() * 2);
    if (comienzo == 0) {
        combate(gladiador1, gladiador2, messageCopy);
    } else {
        combate(gladiador2, gladiador1, messageCopy);
    }
    if (gladiador1.vida == 0 && gladiador2.vida == 0) {
        logCombate.push(gladiador1.nombre + " y " + gladiador2.nombre + ", sois maricones");
        perdedor = [gladiador1, gladiador2];
    } else if (gladiador1.vida > 0) {
        ganador = gladiador1;
        logCombate.push(":trophy:\u00A1El ganador del combate es " + gladiador1.nombre + "!:trophy:");
        perdedor = gladiador2;
        logCombate.push(perdedor.nombre + ", maric\u00F3n");
    } else {
        ganador = gladiador2;
        logCombate.push(":trophy:\u00A1El ganador del combate es " + gladiador2.nombre + "!:trophy:");
        perdedor = gladiador1;
        logCombate.push(perdedor.nombre + ", maric\u00F3n");
    }
    messageCopy.channel.send(logCombate[0] + "\nTurno 1:\n" + logCombate[1]);
    leerRondasPelea(gladiador1, gladiador2, messageCopy);
}
/**
 * Funcion donde discurre todo el combate
 * @param {gladiador} gladiador1
 * @param {gladiador} gladiador2
 * @param {Discord.Message} message
 */
function combate(gladiador1, gladiador2, message) {
    var logCombateText = "";
    var critico = gladiador1.nombre==adminActual.nombre ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 7) + 1;
    var esquive = gladiador1.nombre==adminActual.nombre ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 7) + 1;
    var parry = gladiador1.nombre==adminActual.nombre ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 4) + 1;
    var eventoImprobable = Math.floor(Math.random() * 100);
    if (eventoImprobable != 23) {
        if (parry == 1) {
            var stun = Math.floor(Math.random() * 5);
            if (stun <= 1) {
                if (critico == 1) {
                    logCombateText += `🐱‍👤 ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra hacerle parry al ataque **cr\u00EDtico** y le stunea durante 1 turno.🐱‍👤\n`;
                }
                else {
                    logCombateText += `🐱‍👤 ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra hacerle parry y le stunea durante 1 turno.🐱‍👤\n`;
                }
                logCombateText += gladiador2.nombre + ": <:sonrisa:801799866212417606>\n";
                logCombateText += gladiador1.nombre + ": <:6061_unsettledtom:602529346711846933>\n";
                let hostia = Math.floor(Math.random() * 21) + 20;
                logCombateText += `⚔️ ${gladiador2.nombre} golpea a ${gladiador1.nombre} infligiendole ${hostia} puntos de da\u00F1o.⚔️\n`;
                gladiador1.vida -= hostia;
            }
            else {
                if (critico == 1) {
                    logCombateText += `🐱‍👤 ${gladiador1.nombre} intenta golpear pero  ${gladiador2.nombre} logra hacerle parry al ataque **cr\u00EDtico** y le hace  ${parryDmg}  puntos de da\u00F1o.🐱‍👤\n`;
                } else {
                    logCombateText += `🐱‍👤 ${gladiador1.nombre}  intenta golpear pero  ${gladiador2.nombre} logra hacerle parry y le hace ${parryDmg} puntos de da\u00F1o.🐱‍👤\n`;
                }
                gladiador1.vida -= parryDmg;
            }
        } else if (esquive == 1) {
            if (critico == 1) {
                logCombateText += `🛡️ ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra esquivar el ataque **cr\u00EDtico**.🛡️\n`;
            } else {
                logCombateText += `🛡️ ${gladiador1.nombre} intenta golpear pero ${gladiador2.nombre} logra esquivar el ataque.🛡️\n`;
            }
            if (gladiador2.vida < 100) {
                logCombateText += `❤️ ${gladiador2.nombre} se toma una poti a su salud y recupera ${Math.floor((100 - gladiador2.vida) * 50 / 100)} puntos de salud.❤️\n`;
                gladiador2.vida += Math.floor((100 - gladiador2.vida) * 50 / 100);
            }
        } else if (critico == 1) {
            var hostiaCritico = Math.floor(Math.random() * 21) + 60;
            logCombateText += `💥 ${gladiador1.nombre} golpea y le causa un da\u00F1o tremendo a ${gladiador2.nombre} infligiendole ${hostiaCritico} puntos de da\u00F1o.💥\n`;
            logCombateText += gladiador1.nombre + ": <:maestria7:761734001190109194>\n";
            gladiador2.vida -= hostiaCritico;
        }
        else {
            let hostia = Math.floor(Math.random() * 21) + 20;
            logCombateText += `⚔️ ${gladiador1.nombre} golpea a ${gladiador2.nombre} infligiendole ${hostia} puntos de da\u00F1o.⚔️\n`;
            gladiador2.vida -= hostia;
        }
        gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
        gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
        logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
        logCombate.push(logCombateText);
    } else {
        let evento = eventosRandom[Math.floor(Math.random() * eventosRandom.length)];

        switch (evento) {
            case eventosRandom[0]:
                logCombateText += `🤘😔 ${gladiador1.nombre} se da cuenta de que vive en un mundo virtual, ante tal hecho decide que lo mejor es suicidarse.🤘😔\n`;
                gladiador1.vida -= gladiador1.vida;
                gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
                gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
                logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
                logCombate.push(logCombateText);
                break;
            case eventosRandom[1]:
                sucedioEventoUdyr = true;
                logCombateText += `🐻Aparece <@!766271573271248926> y gankea por sorpresa a ${gladiador1.nombre} y a ${gladiador2.nombre}.🐻\n`;
                gladiador1.vida = 0;
                gladiador2.vida = 0;
                gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
                gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
                logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
                logCombate.push(logCombateText);
                logCombate.push("🏆\u00A1El ganador del combate es <@!766271573271248926>!🏆");
                break;
            case eventosRandom[2]:
                logCombateText += "🥰De tanto darse de hostias se dan cuenta de que estan hechos el uno para el otro y abandonan el combate.🥰\n";
                gladiador1.vida = 0;
                gladiador2.vida = 0;
                gladiador1.vida = gladiador1.vida > 100 ? 100 : gladiador1.vida;
                gladiador2.vida = gladiador2.vida > 100 ? 100 : gladiador2.vida;
                logCombateText += `${gladiador1.nombre}: ${gladiador1.vida} puntos de vida restantes\n ${gladiador2.nombre}: ${gladiador2.vida} puntos de vida restantes.`;
                logCombate.push(logCombateText);
                sucedioEventoAmor = true;
                logCombate.push("🏆\u00A1El ganador del combate es el amor!🏆");
                break;
        }
    }
    if (gladiador1.vida > 0 && gladiador2.vida > 0) {
        combate(gladiador2, gladiador1, message);
    }
}

/**
 * @param {gladiador} gladiador1
 * @param {gladiador} gladiador2
 * @param {Message} message
 */
async function leerRondasPelea(gladiador1, gladiador2, message) {
    if (turno == logCombate.length - 2) {
        var final = logCombate[logCombate.length - 2] + "\n" + logCombate[logCombate.length - 1];
        message.channel.send(final);
        logCombate = [];
        jugarseElTitulo = false;
        var guildMembers = await message.guild.members.fetch();
        var guildRoles = await message.guild.roles.fetch();
        turno = 2;
        if (sucedioEventoUdyr) {
            var udyr = guildMembers.find(member => member.id == "766271573271248926");
            let miembroPerdedor1 = guildMembers.find(member => member.displayName == perdedor[0].nombre);
            let miembroPerdedor2 = guildMembers.find(member => member.displayName == perdedor[1].nombre);
            var role = guildRoles.cache.find(role => role.name == "El Admin");
            if (miembroPerdedor1.roles.cache.get(role.id) || miembroPerdedor2.roles.cache.get(role.id)) {
                miembroPerdedor1.roles.remove(role.id);
                miembroPerdedor2.roles.remove(role.id);
                udyr.roles.add(role);
                message.channel.send(`<:1990_praisethesun:602528888400379935><@!${udyr.id}> es el nuevo Admin de este servidor<:1990_praisethesun:602528888400379935>`);
                message.channel.send("", { files: ["./images/udyr-admin.jpg"] });
                var dateNow = new Date();
                dateNow.setHours(dateNow.getHours() - horasDiferencia + 1);
                dateNow.setSeconds(0);
                adminActual = new admin(udyr.displayName, dateNow);
                var oldAdmin = await adminModel.find();
                var oldAdminModel = oldAdmin[0];
                var crear = await adminModel.create({
                    userID: udyr.id,
                    endDate: dateNow
                });
                crear.save();
                var prueba = await adminModel.findOneAndRemove({
                    userID: oldAdminModel.userID
                })
                prueba.save();
            }
        } else if (sucedioEventoAmor) {
            var maricon1 = guildMembers.find(member => member.displayName == gladiador1.nombre);
            var maricon2 = guildMembers.find(member => member.displayName == gladiador2.nombre);
            var udyr = guildMembers.find(member => member.id == "766271573271248926");
            var soledad = guildMembers.find(member => member.id == "285480424904327179");
            var roleAdmin = guildRoles.cache.find(role => role.name == "El Admin");
            var roleMaricones = guildRoles.cache.find(role => role.name == "Maricones");
            if (maricon1.roles.cache.get(roleAdmin.id) || maricon2.roles.cache.get(roleAdmin.id)) {
                if (maricon1.displayName != udyr.displayName && maricon2.displayName != udyr.displayName) {
                    udyr.roles.add(roleAdmin);
                    message.channel.send("<:1990_praisethesun:602528888400379935><@!" + udyr.id + "> es el nuevo Admin de este servidor<:1990_praisethesun:602528888400379935>");
                    message.channel.send("", { files: ["./images/udyr-admin.jpg"] });
                    var dateNow = new Date();
                    dateNow.setHours(dateNow.getHours() - horasDiferencia + 1);
                    dateNow.setSeconds(0);
                    adminActual = new admin(udyr.displayName, dateNow);
                    var oldAdmin = await adminModel.find();
                    var oldAdminModel = oldAdmin[0];
                    var crear = await adminModel.create({
                        userID: udyr.id,
                        endDate: dateNow
                    });
                    crear.save();
                    var prueba = await adminModel.findOneAndRemove({
                        userID: oldAdminModel.userID
                    })
                } else {
                    soledad.roles.add(roleAdmin);
                    message.channel.send("<:1990_praisethesun:602528888400379935><@!" + soledad.id + "> es el nuevo Admin de este servidor<:1990_praisethesun:602528888400379935>.");
                    dateNow = new Date();
                    dateNow.setHours(dateNow.getHours() - horasDiferencia + 1);
                    dateNow.setSeconds(0);
                    adminActual = new admin(soledad.displayName, dateNow);
                    var oldAdmin = await adminModel.find();
                    var oldAdminModel = oldAdmin[0];
                    var crear = await adminModel.create({
                        userID: soledad.id,
                        endDate: dateNow
                    });
                    crear.save();
                    var prueba = await adminModel.findOneAndRemove({
                        userID: oldAdminModel.userID
                    })
                }
            }
            maricon1.roles.remove(roleAdmin.id);
            maricon2.roles.remove(roleAdmin.id);
            maricon1.roles.add(roleMaricones);
            maricon2.roles.add(roleMaricones);
            setTimeout(function () {
                maricon1.roles.remove(roleMaricones.id);
                maricon2.roles.remove(roleMaricones.id);
            }, 10800000);

        } else {
            let miembroGanador = guildMembers.find(member => member.displayName == ganador.nombre);
            let miembroPerdedor = guildMembers.find(member => member.displayName == perdedor.nombre);
            var role = guildRoles.cache.find(role => role.name == "El Admin");
            if (miembroPerdedor.roles.cache.get(role.id)) {
                miembroPerdedor.roles.remove(role.id);
                miembroGanador.roles.add(role);
                banquillo = [];
                message.channel.send("<:1990_praisethesun:602528888400379935><@!" + miembroGanador.id + "> es el nuevo Admin de este servidor<:1990_praisethesun:602528888400379935>");
                if (miembroPerdedor.id == "766271573271248926") {
                    message.channel.send("", { files: ["./images/udyr-no-admin.jpg"] });
                } else {
                    let link = './images/admin/'
                    var enlaces = fs.readdirSync(link);
                    message.channel.send("", { files: [`${link}${enlaces[Math.floor(Math.random() * enlaces.length)]}`] });
                }
                var dateNow = new Date();
                dateNow.setHours(dateNow.getHours() - horasDiferencia + 1);
                dateNow.setSeconds(0);
                adminActual = new admin(miembroGanador.displayName, dateNow);
                var oldAdmin = await adminModel.find();
                var oldAdminModelID = oldAdmin[0].userID;
                var crear = await adminModel.create({
                    userID: miembroGanador.id,
                    endDate: dateNow
                });
                crear.save();
                var prueba = await adminModel.findOneAndRemove({
                    userID: oldAdminModelID
                })
            } else if (miembroGanador.roles.cache.get(role.id)) {
                var dateNow = new Date();
                dateNow.setHours(dateNow.getHours() - horasDiferencia + 1);
                dateNow.setSeconds(0);
                message.channel.send(miembroPerdedor.displayName + " no puede volver a enfrentarse a " + miembroGanador.displayName + " hasta dentro de 1 hora (" + dateNow.getHours() + ":" + metodosUtiles.cambiarMinutos(dateNow) + ").");
                banquillo.push(miembroPerdedor.displayName);
                setTimeout(function () {
                    for (let i = 0; i < banquillo.length; i++) {
                        if (banquillo[i] == miembroPerdedor.displayName) {
                            banquillo.splice(i, 1);
                            break;
                        }
                    }
                }, 3600000);
                metodosUtiles.cambiarPuntos(miembroPerdedor.id,`-${puntos_peaje}`);
                metodosUtiles.cambiarPuntos(miembroGanador.id,`+${puntos_peaje}`);
                message.channel.send(`El maric\u00F3n de ${miembroPerdedor.displayName} ha perdido ${puntos_peaje} <:udyrcoin:825031865395445760>`);
            }
        }
        sucedioEventoAmor = false;
        sucedioEventoUdyr = false;
        perdedor = "";
        ganador = "";
        return;
    } else {
        setTimeout(function () {
            message.channel.send("Turno " + turno + ":\n" + logCombate[turno++] + "\n\n");
            leerRondasPelea(gladiador1, gladiador2, message);
        }, 6000);
    }

}
