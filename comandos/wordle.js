const { Message, Client } = require('discord.js');
const fs = require('fs');

const wordleModel = require('../models/wordleSchema');
var resultadosPersonales = new Map()
var letrasBien = new Map()
var letrasMal = new Map()
const profileModel = require('../models/profileSchema');

/**
 * @param {String} id
 * @param {String} letra
 * @param {Map} map
 */
function meterValor(map, letra, id) {
    letra = letra.toUpperCase()
    var letras = map.get(id)
    if (letras == undefined) {
        letras = [letra]
        map.set(id, letras)
    } else if (letras.includes(letra) == false) {
        letras.push(letra)
    }
}

/**
 * 
 * @param {string} id 
 */
function borrarResultados(id) {
    resultadosPersonales.delete(id)
    letrasBien.delete(id)
    letrasMal.delete(id)
}

module.exports = {
    name: 'wordle',
    aliases: [],
    description: 'Funcion para hacer el wordle',
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
        //AQUI SE MIRA SI LO HACES EN PRIVADO
        if (message.guild != null) {
            message.channel.send("El wordle solo se hace en privado que sino es mucho spam").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 10000);
            })
            console.log(`FIN ${cmd.toUpperCase()}`)
            return
        }
        //AQUI SI LA PALABRA EXISTE Y ESTA VERIFICADA
        var hoy = moment().format('DD/MM/YYYY')
        var palabra = await wordleModel.findOne({ dia: hoy })
        var palabraWordle = ""
        if (!palabra) {
            await wordleModel.remove({})
            try {
                var data = fs.readFileSync('./wordle/wordle.txt', 'utf8')
            } catch (err) {
                console.error(err)
                return
            }
            var inputs = data.split("\n")
            palabraWordle = inputs[Math.floor(Math.random() * inputs.length)]
            let registro = await wordleModel.create({
                palabra: palabraWordle,
                dia: hoy,
                aprobada: false
            })
            await registro.save()
            message.channel.send(`El wordle de hoy todavia no esta aprobado por la moderacion`)
            return
        } else if (palabra.aprobada == false) {
            message.channel.send(`El wordle de hoy todavia no esta aprobado por la moderacion`)
            return
        }
        else {
            palabraWordle = palabra.palabra
        }
        //AQUI COMPRUEBO SI EL USUARIO VA A RECIBIR RECOMPENSA POR HACER EL WORDLE
        var dineros = true
        if (profileData && moment(profileData.dailyGift).startOf('day').diff(moment().startOf('day'), "days") == 0) {
            dineros = false
        }
        //AQUI SI HAS HECHO HOY EL WORDLE
        if (profileData.wordle != undefined && profileData.wordle == hoy) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("Ya has hecho el wordle de hoy")
        }
        await profileModel.findOneAndUpdate({
            userID: message.author.id,
            serverID: "598896817157046281"
        }, {
            $set: {
                wordleEmpezado: true
            }
        })

        var guess = args[0]
        if (guess == undefined) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("Se te olvid\u00F3 poner una palabra despues de escribir 'udyr wordle'")
        }
        guess = guess.toLowerCase()
        if (guess.length != 5) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("esa no es una palabra de 5 letras")
        }
        if (!inputs.includes(guess)) {
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("esa palabra no la tengo en el diccionario :(")
        }

        var mapeoPalabra = new Map()
        for (let i = 0; i < palabraWordle.length; i++) {
            if (mapeoPalabra.get(palabraWordle.charAt(i))) {
                var numero = mapeoPalabra.get(palabraWordle.charAt(i))
                mapeoPalabra.set(palabraWordle.charAt(i), numero + 1)
            } else {
                mapeoPalabra.set(palabraWordle.charAt(i), 1)
            }
        }
        var result = new Map()
        for (let i = 0; i < guess.length; i++) {
            if (guess.charAt(i) == palabraWordle.charAt(i)) {
                result.set(i, ":green_square:|")
                meterValor(letrasBien, guess.charAt(i), message.author.id)
                mapeoPalabra.set(guess.charAt(i), mapeoPalabra.get(guess.charAt(i)) - 1)
            } else {
                if (mapeoPalabra.get(guess.charAt(i))) {
                    meterValor(letrasBien, guess.charAt(i), message.author.id)
                    var encontrado = false
                    for (let j = guess.length - 1; j > i; j--) {
                        if (palabraWordle.charAt(j) == guess.charAt(j) && guess.charAt(j) == guess.charAt(i)) {
                            result.set(j, ":green_square:|")
                            encontrado = true
                            mapeoPalabra.set(guess.charAt(i), mapeoPalabra.get(guess.charAt(i)) - 1)
                            if (mapeoPalabra.get(guess.charAt(i)) == 0) {
                                mapeoPalabra.delete(guess.charAt(i))
                                break
                            }
                        }
                    }
                    if (!encontrado) {
                        result.set(i, ":yellow_square:|")
                        mapeoPalabra.set(guess.charAt(i), mapeoPalabra.get(guess.charAt(i)) - 1)
                        if (mapeoPalabra.get(guess.charAt(i)) == 0) {
                            mapeoPalabra.delete(guess.charAt(i))
                        }
                    } else {
                        if (mapeoPalabra.get(guess.charAt(i))) {
                            result.set(i, ":yellow_square:|")
                        } else {
                            result.set(i, ":black_large_square:|")
                        }
                    }
                } else {
                    result.set(i, ":black_large_square:|")
                    meterValor(letrasMal, guess.charAt(i), message.author.id)
                }
            }
        }
        var mensaje = ""
        for (let i = 0; i < 5; i++) {
            mensaje += result.get(i)
        }
        mensaje = "|" + mensaje
        if (resultadosPersonales.get(message.author.id)) {
            resultadosPersonales.set(message.author.id, resultadosPersonales.get(message.author.id) + mensaje + "\n")
        } else {
            resultadosPersonales.set(message.author.id, mensaje + "\n")
        }
        message.channel.send(`Intento ${resultadosPersonales.get(message.author.id).split("\n").length - 1}/6\n` + mensaje)
        var puntos = 0
        if (mensaje == "|:green_square:|:green_square:|:green_square:|:green_square:|:green_square:|") {
            message.channel.send(`Que vas de listo o que`)
            message.channel.send(`Udyr Wordle #${moment().startOf('day').diff(moment().startOf('year'), "days") + 1} ${resultadosPersonales.get(message.author.id).split("\n").length - 1}/6\n${resultadosPersonales.get(message.author.id)}`)
            puntos = 120 - 20 * ((resultadosPersonales.get(message.author.id).split("\n").length - 1) - 1)
            if (dineros == true) {
                message.channel.send(`Has ganado ${puntos} <:udyrcoin:825031865395445760>`)
            }
            const textChannel = client.guilds.cache.get("598896817157046281").channels.cache.find(channel => channel.id === "809786674875334677" && channel.isText())
            textChannel.send(`Resultado de ${message.author.username}\nUdyr Wordle #${moment().startOf('day').diff(moment().startOf('year'), "days") + 1} ${resultadosPersonales.get(message.author.id).split("\n").length - 1}/6\n${resultadosPersonales.get(message.author.id)}`)
            borrarResultados(message.author.id)
            if (dineros == true) {
                await profileModel.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: "598896817157046281"
                }, {
                    $inc: {
                        udyrcoins: puntos
                    },
                    $set: {
                        wordle: hoy,
                        wordleEmpezado: false
                    }
                })
            } else {
                await profileModel.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: "598896817157046281"
                }, {
                    $set: {
                        wordle: hoy,
                        wordleEmpezado: false
                    }
                })
            }

        } else if ((resultadosPersonales.get(message.author.id).split("\n").length - 1) == 6) {
            message.channel.send(`Sos malisimo perro, la palabra era **_${palabraWordle.toUpperCase()}_**`)
            message.channel.send(`Udyr Wordle #${moment().startOf('day').diff(moment().startOf('year'), "days") + 1} X/6\n${resultadosPersonales.get(message.author.id)}`)
            const textChannel = client.guilds.cache.get("598896817157046281").channels.cache.find(channel => channel.id === "809786674875334677" && channel.isText())
            textChannel.send(`Resultado de ${message.author.username}\nUdyr Wordle #${moment().startOf('day').diff(moment().startOf('year'), "days") + 1} X/6\n${resultadosPersonales.get(message.author.id)}`)
            borrarResultados(message.author.id)
            await profileModel.findOneAndUpdate({
                userID: message.author.id,
                serverID: "598896817157046281"
            }, {
                $set: {
                    wordle: hoy,
                    wordleEmpezado: false
                }
            })
        } else {
            message.channel.send(`LETRAS CORRECTAS: ${letrasBien.get(message.author.id) != undefined ? letrasBien.get(message.author.id).join(" ") : ""}\nLETRAS DESCARTADAS: ${letrasMal.get(message.author.id) != undefined ? letrasMal.get(message.author.id).join(" ") : ""}`)
        }
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}