const { Message, Client } = require('discord.js');
const fs = require('fs');

const wordleModel = require('../models/wordleSchema');
var resultadosPersonales = new Map()
var letrasBien = new Map()
var letrasMal = new Map()
const profileModel = require('../models/profileSchema');


module.exports = {
    name: 'palabra',
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
        return;
        if (message.author.id != "202065665597636609") {
            if (message.guild) {
                return message.channel.send("A callar friki")
            } else {
                return message.author.send("A callar friki")
            }
        }

        if (message.guild) {
            return message.channel.send("Bro eso por privado que hay gente mirando").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 7000);
            })
        }
        //AQUI SI LA PALABRA EXISTE Y ESTA VERIFICADA
        var aprobado = args[0]
        var hoy = moment().format('DD/MM/YYYY')
        var palabra = await wordleModel.findOne({ dia: hoy })
        var palabraWordle = ""
        if (!palabra || aprobado == "false") {
            await wordleModel.deleteMany({})
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
            message.channel.send(`El wordle de hoy es **${palabraWordle.toUpperCase()}**`)
            return
        } else if (palabra.aprobada == false && aprobado == "true") {
            await wordleModel.findOneAndUpdate({ dia: hoy }, {
                $set: {
                    aprobada: true
                }
            })
            const textChannel = client.guilds.cache.get("598896817157046281").channels.cache.find(channel => channel.id === "809786674875334677" && channel.isText())
            textChannel.send(`EL WORDLE DE HOY ESTA LISTO`)
        }
        else {
            message.channel.send(`El wordle de hoy es **${palabra.palabra.toUpperCase()}**`)
        }
    }
}