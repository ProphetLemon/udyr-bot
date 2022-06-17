const { Client, Message } = require("discord.js")
const Discord = require("discord.js")
const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')
const { createAudioPlayer, joinVoiceChannel, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
var servidores = new Map()
module.exports = {
    name: 'pomodoro',
    aliases: ['estudio'],
    description: "Mi propio commando pomodoro",
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {Discord} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`);
        if (message.member.voice.channel == null || message.member.voice.channel.id != "986959978273337405") {
            return message.reply("Tienes que estar en el chat de voz \"Sala de estudio📚\"").then(msg => {
                if (message.guild) {
                    message.delete()
                    setTimeout(() => {
                        msg.delete()
                    }, 6000);
                }
            })
        }
        if (message.channel.id != "986959978273337405") {
            return message.reply("Eso mejor en el chat de \"Sala de estudio📚\"").then(msg => {
                if (message.guild) {
                    message.delete()
                    setTimeout(() => {
                        msg.delete()
                    }, 6000);
                }
            })
        }
        if (args.length > 0 && ["stop", "leave"].some(el => args[0] == el)) {
            var servidor = servidores.get(message.guild.id)
            if (!servidor) {
                return message.reply("No se habia empezado un pomodoro")
            }
            servidor.connection.destroy()
            clearTimeout(servidor.timeout)
            servidores.delete(message.guild.id)
            message.delete()
            return
        }
        var connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: true
        })
        var servidor = {
            connection: connection,
            player: createAudioPlayer(),
            enlaces: fs.readFileSync('./audios/links.txt', 'utf8').split("\n"),
            pomodoros: 0,
            break: null,
            timeout: null
        }
        servidores.set(message.guild.id, servidor)
        message.delete()
        servidor.player.on(AudioPlayerStatus.Idle, () => {
            getNextResource(servidor);
        });
        servidor.player.on("error", () => {
            getNextResource(servidor);
        });
        getNextResource(servidor)
        configurarTiempos(servidor)
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}

function configurarTiempos(servidor) {
    if (servidor.break == null || servidor.break == true) {
        servidor.break = false
        servidor.timeout = setTimeout((servidor) => {
            configurarTiempos(servidor)
        }, 25 * 60 * 1000, servidor);
    } else if (servidor.break == false) {
        servidor.pomodoros = servidor.pomodoros + 1
        servidor.break = true
        servidor.player.pause()
        servidor.timeout = setTimeout((servidor) => {
            configurarTiempos(servidor)
        }, (servidor.pomodoros % 4 == 0 ? 15 : 5) * 60 * 1000, servidor);
    }
}

async function getNextResource(servidor) {
    if (servidor.enlaces.length == 0) {
        servidor.enlaces = fs.readFileSync('./audios/links.txt', 'utf8').split("\n")
    }
    const seleccion = Math.floor(Math.random() * servidor.enlaces.length)
    const stream = await ytdl(servidor.enlaces[seleccion], { filter: 'audioonly' });
    const resource = await createAudioResource(stream)
    servidor.enlaces.splice(seleccion, 1)
    servidor.player.play(resource)
    servidor.connection.subscribe(servidor.player)
    servidor.player.pause()
}
