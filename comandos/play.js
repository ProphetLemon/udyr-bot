const Discord = require('discord.js')
const { Client, Message, EmbedBuilder } = require('discord.js')
const { createAudioPlayer, createAudioResource, StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection, VoiceConnection, AudioPlayer } = require('@discordjs/voice')
const play = require('play-dl')

class Constructor {
    /**
     * 
     * @param {VoiceConnection} connection 
     * @param {Cancion[]} songs 
     * @param {Discord.TextChannel} channel 
     * @param {AudioPlayer} player 
     */
    constructor(connection, songs, channel, player) {
        this.connection = connection
        this.songs = songs
        this.channel = channel
        this.player = player
    }
}

class Cancion {
    /**
     * 
     * @param {string} autor 
     * @param {string} url 
     * @param {string} titulo
     */
    constructor(autor, url, titulo) {
        this.url = url
        this.autor = autor
        this.titulo = titulo
    }
}

const queue = new Map()

module.exports = {
    name: 'play',
    aliases: ['skip', 'resume', 'pause', 'leave', 'stop', 'cola', 'shuffle', 'cambiar', "shufflefair"],
    description: 'Bot de musica avanzado',
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
        console.log(`INICIO ${cmd.toUpperCase()}`)
        /**
            //MODO RADIO
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        const player2 = createAudioPlayer();
        const resource = createAudioResource('https://rtvelivestream.akamaized.net/eventual/oca/irtve19_main_720.m3u8');
            //play the song resource
        player2.play(resource);
        connection.subscribe(player2);
        return
        **/
        if (!message.channel.name || !(message.channel.name.includes("musica") || message.channel.name.includes("música"))) return message.channel.send("Escribe esto en el canal de música anda").then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 5000);
        })
        if (!message.member.voice?.channel) return message.channel.send('Ponte en un chat de voz, maricón').then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 5000);
        })
        var constructor = getConstructor(message.guildId)
        if (cmd == "shufflefair") return shuffle_fair(constructor)
        if (cmd == "skip") return skip_song(constructor, args[0])
        if (cmd == "pause") return control_player(constructor, 0)
        if (cmd == "resume") return control_player(constructor, 1)
        if (cmd == "cola") return show_queue(constructor)
        if (cmd == "cambiar") return change(constructor, args[0], args[1])
        if (cmd == "shuffle") return shuffle(constructor)
        if (cmd == "stop" || cmd == "leave") return leave(constructor)
        if (!constructor) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            })
            var player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            })
            player.guildId = message.guildId
            player.on('stateChange', async (oldState, newState) => {
                if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle) {
                    var constructor = queue.get(player.guildId)
                    if (constructor.songs.length == 0) {
                        constructor.connection.destroy()
                        constructor.channel.send("Me voy que os jodan :bear::middle_finger:")
                        queue.delete(player.guildId)
                        return
                    }
                    play_song(constructor)
                }
            });
            connection.subscribe(player)
            constructor = new Constructor(connection, [], message.channel, player)
            queue.set(message.guildId, constructor)
        }
        constructor = getConstructor(message.guildId)
        let ytSearch = args.join(" ")
        var authorId = message.author.id
        if (play.yt_validate(ytSearch) == "video") {
            let yt_info = await play.video_info(ytSearch)
            constructor.channel.send(`:bear::thumbup: **${yt_info.video_details.title}** añadida a la cola`)
            constructor.songs.push(new Cancion(authorId, ytSearch))
            queue.set(message.guildId, constructor)
        } else if (play.yt_validate(ytSearch) == "playlist") {
            let yt_info = await play.playlist_info(ytSearch)
            let videos = await yt_info.all_videos()
            for (let i = 0; i < videos.length; i++) {
                constructor.songs.push(new Cancion(authorId, videos[i].url, videos[i].title))
            }
            constructor.channel.send(`:bear::thumbup: **${yt_info.total_videos}** canciones añadidas a la cola`)
            queue.set(message.guildId, constructor)
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
            }) // This will search the found track on youtube.
            constructor.channel.send(`:bear::thumbup: **${searched[0].title}** añadida a la cola`)
            constructor.songs.push(new Cancion(authorId, searched[0].url, searched[0].title))
            queue.set(message.guildId, constructor)
        } else if (play.sp_validate(ytSearch) == "playlist" || play.sp_validate(ytSearch) == "album") {
            var msgEdit = await constructor.channel.send("Cargadas **0** canciones...")
            if (play.is_expired()) {
                await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
            }
            let sp_data = await play.spotify(args[0]) // This will get spotify data from the url [ I used track url, make sure to make a logic for playlist, album ]
            var songs = await sp_data.all_tracks()
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
                constructor.songs.push(new Cancion(authorId, searched[0].url, searched[0].title))
                ++cont
                if (cont % 5 == 0) {
                    var msgContentEdit = msgEdit.content.split("**")
                    msgContentEdit[1] = cont
                    await msgEdit.edit(msgContentEdit.join("**"))
                }
            }
            msgEdit.delete()
            constructor.channel.send(`:bear::thumbup: **${songs.length}** canciones añadidas a la cola`)
            queue.set(message.guildId, constructor)
        } else {
            let yt_info = await play.search(ytSearch, {
                limit: 1
            })
            if (!yt_info[0]) return message.channel.send("Aprende a escribir maricón")
            constructor.channel.send(`:bear::thumbup: **${yt_info[0].title}** añadida a la cola`)
            constructor.songs.push(new Cancion(authorId, yt_info[0].url, yt_info[0].title))
            queue.set(message.guildId, constructor)
        }
        play_song(constructor)
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}

/**
 * 
 * @param {Constructor} constructor 
 * @param {boolean} trigger 
 */
function control_player(constructor, trigger) {
    console.log(`INICIO control_player`)
    if (!constructor) {
        console.log(`FIN control_player`)
        return
    }
    if (trigger == 0) {
        constructor.player.pause()
    } else {
        constructor.player.unpause()
    }
    console.log(`FIN control_player`)
}

/**
 * 
 * @param {string} guildId 
 * @returns {Constructor}
 */
function getConstructor(guildId) {
    return queue.get(guildId)
}

/**
 * 
 * @param {Constructor} constructor 
 * @param {string} songA 
 * @param {string} songB 
 */
function change(constructor, songA, songB) {
    console.log(`INICIO change`)
    if (isNaN(songA) || isNaN(songB)) {
        return
    }
    songA = Math.floor(Number(songA))
    songB = Math.floor(Number(songB))
    if (songA < 1 || songA > constructor.songs.length || songB < 1 || songB > constructor.songs.length) {
        return constructor.channel.send("Te has pasado de rango, maricón")
    }
    songA -= 1
    songB -= 1
    let songAux = constructor.songs[songA]
    constructor.songs[songA] = constructor.songs[songB]
    constructor.songs[songB] = songAux
    queue.set(constructor.channel.guildId, constructor)
    constructor.channel.send(":bear::thumbup: Se han intercambiado las canciones correctamente")
    console.log(`FIN change`)
    show_queue(constructor)
}

/**
 * 
 * @param {Constructor} constructor 
 */
function shuffle_fair(constructor) {
    console.log(`INICIO shuffle_fair`)
    var songs = constructor.songs
    var ids = []
    for (let song of songs) {
        if (!ids.includes(song.autor)) {
            ids.push(song.autor)
        }
    }
    songs = shuffleArray(songs)
    var shuffledFairArray = []
    var cont = 0
    while (songs.length > 0) {
        let id = ids[cont++ % ids.length]
        var trigger = false
        for (let i = 0; i < songs.length; i++) {
            let song = songs[i]
            if (song.autor == id) {
                shuffledFairArray.push(song)
                songs.splice(i, 1)
                trigger = true
                break;
            }
        }
        if (!trigger) {
            ids.splice(cont - 1, 1)
        }
    }
    constructor.songs = shuffledFairArray
    queue.set(constructor.channel.guildId, constructor)
    constructor.channel.send(":bear::thumbup: Se ha mezclado las canciones de la cola correctamente")
    console.log(`FIN shuffle_fair`)
    show_queue(constructor)
}

/**
 * 
 * @param {Cancion[]} array 
 * @returns 
 */
function shuffleArray(array) {
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
 * @param {Constructor} constructor 
 * @returns 
 */
function shuffle(constructor) {
    console.log(`INICIO shuffle`)
    if (!constructor) return
    var mezcla = shuffleArray(constructor.songs)
    constructor.songs = mezcla
    queue.set(constructor.channel.guildId, constructor)
    constructor.channel.send(":bear::thumbup: Se ha mezclado las canciones de la cola correctamente")
    console.log(`FIN shuffle`)
    show_queue(constructor)
}

/**
 * 
 * @param {Constructor} constructor 
 * @returns 
 */
async function show_queue(constructor) {
    console.log(`INICIO show_queue`)
    if (!constructor) return
    var mensajeUdyr = await constructor.channel.send(":bear::brain: Cargando cola...")
    let limit = constructor.songs.length > 10 ? 10 : constructor.songs.length;
    var mensaje = "**======= :bear: UDYR QUEUE :bear: =======**\n"
    for (let i = 0; i < limit; i++) {
        mensaje += `${i + 1}- ${constructor.songs[i].titulo}\n`
    }
    if (constructor.songs.length > 10) mensaje += `**y ${constructor.songs.length - limit} canciones más....**`
    constructor.channel.send(mensaje).then(msg => {
        mensajeUdyr.delete()
    })
    console.log(`FIN show_queue`)
}

/**
 * 
 * @param {Constructor} constructor 
 * @returns 
 */
function leave(constructor) {
    console.log(`INICIO leave`)
    if (!constructor) return
    constructor.songs = []
    queue.set(constructor.channel.guildId, constructor)
    constructor.player.stop()
    console.log(`FIN leave`)
}

/**
 * 
 * @param {Constructor} constructor 
 * @returns 
 */
async function play_song(constructor) {
    console.log(`INICIO play_song`)
    if (constructor.player.state.status == AudioPlayerStatus.Playing) {
        return
    }
    let yt_info = await play.video_info(constructor.songs[0].url)
    const songEmbed = new EmbedBuilder()
        .setTitle(`:bear::guitar::notes: Está sonando **${yt_info.video_details.title}** :notes::guitar:`)
        .setImage(yt_info.video_details.thumbnails[yt_info.video_details.thumbnails.length - 1].url)
        .setColor("#c16a4f")
        .setDescription(`Duración: ${yt_info.video_details.live ? ':infinity:' : yt_info.video_details.durationRaw}`)
    constructor.channel.send({ embeds: [songEmbed] })
    var stream = await play.stream(constructor.songs[0].url)
    constructor.songs.splice(0, 1)
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })
    constructor.player.play(resource)
    console.log(`FIN play_song`)
}

/**
 * 
 * @param {Constructor} constructor 
 * @param {string} numberSongs
 * @returns 
 */
async function skip_song(constructor, numberSongs) {
    console.log(`INICIO skip_song`)
    if (isNaN(numberSongs)) {
        numberSongs = 0
    } else {
        numberSongs = Number(numberSongs)
    }
    if (!constructor) return
    var songs = constructor.songs
    songs.splice(0, numberSongs)
    constructor.songs = songs
    queue.set(constructor.channel.guildId, constructor)
    constructor.player.stop()
    console.log(`FIN skip_song`)
}