const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();

const { Message } = require('discord.js');
module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'],
    description: 'Bot de musica avanzado',
    /**
     * 
     * @param {Message} message 
     * @param {*} args 
     * @param {*} cmd 
     * @param {*} client 
     * @param {*} Discord 
     */
    async execute(message, args, cmd, client, Discord) {
        cmd = cmd
        console.log(`INICIO ${cmd.toUpperCase()}`)
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('No est\u00E1s en ning\u00FAn canal de voz, maric\u00F3n').then(msg => msg.delete({ timeout: 4000 }))
        const permissions = voice_channel.permissionsFor(message.client.user)
        if (!permissions.has('CONNECT')) return message.channel.send('No tienes permisos, maric\u00F3n').then(msg => msg.delete({ timeout: 4000 }))
        if (!permissions.has('SPEAK')) return message.channel.send('No tienes permisos, maric\u00F3n').then(msg => msg.delete({ timeout: 4000 }))

        const server_queue = queue.get(message.guild.id)

        if (cmd == 'play') {
            if (!args.length) return message.channel.send('No has mandado m\u00FAsica, maric\u00F3n').then(msg => msg.delete({ timeout: 4000 }))
            let song = {}

            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0])
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                const video_finder = async (query) => {
                    const videoResult = await ytSearch(query)
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                const video = await video_finder(args.join(' '))
                if (video) {
                    song = { title: video.title, url: video.url }
                } else {
                    console.log(`FIN ${cmd.toUpperCase()}`)
                    return message.channel.send('Me he liado, no he encontrado nada parecido.')
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
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0])
                } catch (err) {
                    queue.delete(message.guild.id)
                    message.channel.send("No me he podido conectar")
                    throw err
                }
            } else {
                server_queue.songs.push(song)
                console.log(`FIN ${cmd.toUpperCase()}`)
                return message.channel.send(`🐻👍 **${song.title}** a\u00F1adido a la cola`)
            }
        }
        else if (cmd == 'skip') skip_song(message, server_queue)
        else if (cmd == 'stop') stop_song(message, server_queue)
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly' })
    song_queue.connection.play(stream, { seek: 0, volume: 0.5 }).on('finish', () => {
        song_queue.songs.shift()
        video_player(guild, song_queue.songs[0])
    })
    await song_queue.text_channel.send(`🐻💿🎶 Ahora est\u00E1 sonando **${song.title}**`)
}

const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) {
        return message.channel.send("Igual tendrias que estar en un canal de voz para dar esas ordenes")
    }
    if (!server_queue) {
        return message.channel.send("No me lies friki, no hay nada en la cola")
    }
    server_queue.connection.dispatcher.end()
}

const stop_song = (message, server_queue) => {
    if (!message.member.voice.channel) {
        return message.channel.send("Igual tendrias que estar en un canal de voz para dar esas ordenes")
    }
    message.reply("que te jodan")
    server_queue.songs = []
    server_queue.connection.dispatcher.end()
}