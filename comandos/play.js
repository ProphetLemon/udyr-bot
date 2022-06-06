const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')
const { Message, Client, Permissions } = require('discord.js');
const { joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus } = require("@discordjs/voice");
const queue = new Map();
//queue(message.guild.id,queue_constructor object {voice channel, connection, song[]})
var player = createAudioPlayer();
var guild
module.exports = {
    name: 'play',
    aliases: ['skip', 'pause', 'leave', 'resume', 'unpause', 'stop'],
    description: 'Bot de musica avanzado',
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
        const voice_channel = message.member.voice.channel
        guild = message.guild
        if (!voice_channel) return message.channel.send('Tienes que estar en un canal de voz')
        const permissions = voice_channel.permissionsFor(message.client.user)
        if (!permissions.has(Permissions.FLAGS.CONNECT)) return message.channel.send("No me puedo conectar :(")
        if (!permissions.has(Permissions.FLAGS.SPEAK)) return message.channel.send("No tengo permiso para hablar :(")
        if (message.channel.name.trim() != "musica") return message.reply("Esto mejor en un canal de música")

        const server_queue = queue.get(message.guild.id)
        let song = {}
        if (cmd === 'play') {
            if (!args.length) return message.channel.send("Bro pero escribe algo")
            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                const video_finder = async (query) => {
                    const videoResult = await ytSearch(query)
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null
                }

                const video = await video_finder(args.join(' '))
                if (video) {
                    song = { title: video.title, url: video.url }
                } else {
                    message.channel.send("No he encontrado nada")
                }
            }
            if (!server_queue) {
                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queue_constructor)
                queue_constructor.songs.push(song)
                try {
                    const connection = await joinVoiceChannel(
                        {
                            channelId: message.member.voice.channel.id,
                            guildId: message.guild.id,
                            adapterCreator: message.guild.voiceAdapterCreator
                        });
                    queue_constructor.connection = connection
                    video_player(message.guild, queue_constructor.songs[0])
                } catch (err) {
                    queue.delete(message.guild.id)
                    message.channel.send("Ha habido un fallo al conectarme al canal de voz")
                    throw err
                }
            } else {
                server_queue.songs.push(song)
                return message.channel.send(`:bear:👍 **${song.title}** se ha a\u00F1adido correctamente`)
            }
        }
        else if (cmd === "skip") skip_song(message, server_queue)
        else if (cmd === "pause") pause_song(message, server_queue)
        else if (cmd === "resume" || cmd == "unpause") resume_song(message, server_queue)
        else if (cmd === "leave" || cmd == "stop") leave(message, server_queue)
    }
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id)
    if (!song) {
        song_queue.songs = []
        song_queue.connection.destroy();
        queue.delete(guild.id)
        await song_queue.text_channel.send(`Me voy, que os jodan`)
        return
    }
    const stream = await ytdl(song.url, { filter: 'audioonly' });
    const resource = await createAudioResource(stream);
    try {
        await player.play(resource);
        song_queue.connection.subscribe(player);
        await song_queue.text_channel.send(`:bear:🎶 Est\u00E1 sonando **${song.title}**`)
    } catch (err) {
        await song_queue.text_channel.send(`jaja me he muerto, vuelve a intentarlo`)
    }
}
const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send("Tienes que estar en un chat de voz para hacer eso")
    if (!server_queue) return message.channel.send(`No hay ninguan canci\u00F3n en cola bro 😞`)
    player.stop()
    server_queue.songs.shift()
    video_player(message.guild, server_queue.songs[0])
}

const leave = async (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send("Tienes que estar en un chat de voz para hacer eso")
    server_queue.songs = []
    server_queue.connection.destroy();
    await server_queue.text_channel.send(`Me voy, que os jodan`)
    queue.delete(guild.id)
}

const pause_song = async (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send("Tienes que estar en un chat de voz para hacer eso")
    player.pause();
    await server_queue.text_channel.send(`Me callo 😶`)
}

const resume_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send("Tienes que estar en un chat de voz para hacer eso")
    player.unpause();
}