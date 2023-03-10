const { Message, Client, EmbedBuilder } = require('discord.js');
const Discord = require('discord.js')
const { Player } = require('discord-player');
const play = require('play-dl')
const players = new Map()
/**
 * 
 * @param {Message} message 
 * @param {Client} client
 * @returns {Player} 
 */
function getPlayer(message, client) {
    var player = players.get(message.guildId)
    if (!player) {
        player = new Player(client)
        // this event is emitted whenever discord-player starts to play a track
        player.events.on('playerStart', async (queue, track) => {
            // we will later define queue.metadata object while creating the queue
            let yt_info = await play.video_info(track.url)
            let thumbnail = yt_info.video_details.thumbnails[yt_info.video_details.thumbnails.length - 1].url
            const songEmbed = new EmbedBuilder()
                .setTitle(`:bear::guitar::notes: Está sonando **${track.title}** :notes::guitar:`)
                .setImage(thumbnail)
                .setColor("#c16a4f")
                .setDescription(`Duración: ${track.duration}`)
            player.channelText.send({ embeds: [songEmbed] })

        });
        player.events.on("disconnect", () => {
            players.delete(message.guildId)
        });
        player.queues.create(message.member.guild, {
            metadata: message.channel
        })
        player.channelText = message.channel
        players.set(message.guildId, player)
    }
    return player
}

module.exports = {
    name: 'play',
    aliases: ['skip'],
    description: 'Funcion ver el raking de puntos',
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
        if (!message.member) {
            return message.reply("No estás en un server")
        }
        var channel = message.member.voice.channel
        if (!channel) {
            return message.reply("No estás en un canal de voz").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 5000);
            })
        }
        const player = getPlayer(message, client)
        if (cmd == "skip") return skip_song(player, message)
        if (cmd == "leave") return leave(player, message)
        let ytSearch = args.join(" ")
        var authorId = message.author.id
        if (play.yt_validate(ytSearch) == "video") {
            let yt_info = await play.video_info(ytSearch)
            await player.play(channel, yt_info.video_details.url)
            player.channelText.send(`Se ha añadido correctamente la canción 🐻👍`)
        } else if (play.yt_validate(ytSearch) == "playlist") {
            let yt_info = await play.playlist_info(ytSearch)
            let videos = await yt_info.all_videos()
            for (let i = 0; i < videos.length; i++) {
                await player.play(channel, videos[i])
            }
            player.channelText.send(`Se han añadido correctamente las canciones 🐻👍`)
        } else if (play.sp_validate(ytSearch) == "track") {
            if (play.is_expired()) {
                await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
            }
            let sp_data = await play.spotify(args[0]) // This will get spotify data from the url [ I used track url, make sure to make a logic for playlist, album ]
            var nameSong = ""
            for (artist of sp_data.artists) {
                nameSong += `${artist.name} `
            }
            nameSong += sp_data.name
            let searched = await play.search(`${nameSong}`, {
                limit: 1
            })
            await player.play(channel, searched[0].url)
            player.channelText.send(`Se ha añadido correctamente la canción 🐻👍`)
        } else if (play.sp_validate(ytSearch) == "playlist" || play.sp_validate(ytSearch) == "album") {
            if (play.is_expired()) {
                await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
            }
            let sp_data = await play.spotify(args[0]) // This will get spotify data from the url [ I used track url, make sure to make a logic for playlist, album ]
            var songs = await sp_data.all_tracks()
            var msgEdit
            await player.channelText.send("Espere: Cargadas **0** canciones...").then(msg => {
                msgEdit = msg
            })
            var cont = 0
            for (let song of songs) {
                var nameSong = ""
                for (artist of song.artists) {
                    nameSong += `${artist.name} `
                }
                nameSong += song.name
                let searched = await play.search(`${nameSong}`, {
                    limit: 1
                }) // This will search the found track on youtube.
                if (searched[0] == undefined) {
                    continue;
                }
                try {
                    await player.play(channel, searched[0].url)
                } catch {
                    continue
                }
                cont++
                if (cont % 5 == 0) {
                    await msgEdit.edit(`Espere: Cargadas **${cont}** canciones...`)
                }
            }
            player.channelText.send(`Se han añadido correctamente las ${cont} canciones 🐻👍`)
        } else {
            let yt_info = await play.search(ytSearch, {
                limit: 1
            })
            if (!yt_info[0]) return message.channel.send("Aprende a escribir maricón")
            await player.play(channel, yt_info[0].url)
            player.channelText.send(`Se ha añadido correctamente la canción 🐻👍`)
        }
    }
}

/**
 * 
 * @param {Player} player 
 * @param {Message} message
 */
function skip_song(player, message) {
    player.queues.get(message.guildId).node.skip()
}

/**
 * 
 * @param {Player} player 
 * @param {Message} message
 */
function leave(player, message) {
    player.queues.get(message.guildId).node.stop()
}