const Discord = require('discord.js')
const { Client, Message, EmbedBuilder } = require('discord.js')
const { createAudioPlayer, createAudioResource, StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const play = require('play-dl')
module.exports = {
    name: 'spotify',
    aliases: ['skip', 'pause', 'leave', 'stop', 'cola', 'shuffle', 'cambiar'],
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
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        if (play.is_expired()) {
            await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
        }



        let sp_data = await play.spotify(args[0]) // This will get spotify data from the url [ I used track url, make sure to make a logic for playlist, album ]
        var canciones1 = await sp_data.fetched_tracks
        var canciones2 = await sp_data.all_tracks()
        for ([key, value] of sp_data.fetched_tracks) {
            console.log(key)
            console.log(value)
        }
        player.play(resource)

        connection.subscribe(player)
        console.log(`FIN ${cmd.toUpperCase()}`)
    }
}

