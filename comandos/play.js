const { Message, Client, EmbedBuilder } = require('discord.js');
const Discord = require('discord.js')
const { Player } = require('discord-player');
const play = require('play-dl')
const players = new Map()
module.exports = {
    name: 'play',
    aliases: ['skip', 'leave', 'shuffle', 'bassboost', 'nightcore', 'earrape', '8d', 'bassboost_high', 'bassboost_low', 'vibrato', 'lofi', 'vaporwave'],
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
        const player = new Player(client)
        if (!players.get(client.user.id)) {
            player.queues.create(message.member.guild, {
                metadata: message.channel
            })
            player.channelText = message.channel
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
            players.set(client.user.id, "piola")
        }

        if (cmd == "skip") return skip_song(player, message)
        if (cmd == "leave") return leave(player, message)
        if (cmd == "shuffle") return shuffle(player, message)
        if (cmd == "bassboost" || cmd == "nightcore" || cmd == "earrape" || cmd == "8d" || cmd == "bassboost_low" || cmd == "bassboost_high" || cmd == "vibrato" || cmd == "lofi" || cmd == "vaporwave") return filtro(player, message, cmd)
        let ytSearch = args.join(" ")
        var authorId = message.author.id
        if (play.yt_validate(ytSearch) == "video") {
            let yt_info = await play.video_info(ytSearch)
            await player.play(channel, yt_info.video_details.url)
            player.channelText.send(`Se ha añadido correctamente la canción 🐻👍`)
        } else if (play.yt_validate(ytSearch) == "playlist") {
            var msgEdit
            await player.channelText.send("Espere: Cargadas **0** canciones...").then(msg => {
                msgEdit = msg
            })
            let yt_info = await play.playlist_info(ytSearch)
            let videos = await yt_info.all_videos()
            var cont = 0
            for (let i = 0; i < videos.length; i++) {
                await player.play(channel, videos[i].url)
                cont++
                if (cont % 5 == 0) {
                    await msgEdit.edit(`Espere: Cargadas **${cont}** canciones...`)
                }
            }
            msgEdit.edit(`Se han añadido correctamente las canciones 🐻👍`)
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
function filtro(player, message, cmd) {
    player.queues.get(message.guildId).filters.ffmpeg.toggle([cmd == '8d' ? '8D' : cmd])
    message.channel.send("Filtro aplicado")
}

/**
 * 
 * @param {Player} player 
 * @param {Message} message
 */
function shuffle(player, message) {
    player.queues.get(message.guildId).tracks.shuffle()
    message.channel.send("Canciones shuffleadas 🐻👍")
}

function shuffle_array(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

/**
 * 
 * @param {Player} player 
 * @param {Message} message
 */
function leave(player, message) {
    player.queues.get(message.guildId).node.stop()
}