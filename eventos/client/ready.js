const { Client, Guild, TextChannel, ActivityType } = require("discord.js");
const Discord = require("discord.js")
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel, NoSubscriberBehavior } = require('@discordjs/voice')
/**
 * @param {Discord} Discord
 * @param {Client} client
 */
module.exports = async (Discord, client) => {
    var guild = client.guilds.cache.get("598896817157046281")
    client.user.setPresence({ status: "dnd", activities: [{ name: 'Furry Online +18', type: ActivityType.Playing }] })
    let commands
    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'estado',
        description: 'Modifica el estado de Udyr',
        options: [
            {
                name: 'status',
                description: 'Estado del bot',
                type: Discord.ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Ocupado",
                        value: "dnd"
                    },
                    {
                        name: "Ausente",
                        value: "idle"
                    },
                    {
                        name: "Conectado",
                        value: "online"
                    }
                ]
            },
            {
                name: 'activitytype',
                description: 'Se define el tipo de actividad',
                type: Discord.ApplicationCommandOptionType.Number,
                required: true,
                choices: [
                    {
                        name: "Viendo",
                        value: ActivityType.Watching
                    },
                    {
                        name: "Compitiendo",
                        value: ActivityType.Competing
                    },
                    {
                        name: "Escuchando",
                        value: ActivityType.Listening
                    },
                    {
                        name: "Jugando",
                        value: ActivityType.Playing
                    },
                    {
                        name: "Streameando",
                        value: ActivityType.Streaming
                    },
                    {
                        name: "Custom",
                        value: ActivityType.Custom
                    }
                ]
            },
            {
                name: 'descripcion',
                description: 'Aqui defines de que va la actividad',
                type: Discord.ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "url",
                description: "URL del streaming. ¡SOLO USAR CUANDO ESTAS EN MODO STREAMING!",
                type: Discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    })

    console.log("El bot ta ready");
}

/**
 * 
 * @param {Guild} guild 
 */
async function poner_audios(guild) {
    var channels = await guild.channels.fetch()
    var voiceChannels = []
    for (let [key, value] of channels) {
        if (value.type == 2 && value.members.size > 0) {
            voiceChannels.push(value)
        }
    }
    if (voiceChannels.length == 0) {
        setTimeout((guild) => {
            poner_audios(guild)
        }, 5000, guild);
    }
    var channelElegido = voiceChannels[Math.floor(Math.random() * voiceChannels.length)]
    const connection = joinVoiceChannel({
        channelId: channelElegido.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    });
    var player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    })
    player.connection = connection
    player.guild = guild
    player.on('stateChange', async (oldState, newState) => {
        if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle) {
            player.connection.destroy()
            setTimeout((guild) => {
                poner_audios(guild)
            }, 5000, player.guild);
        }
    });
    const resource = createAudioResource('./audios/Franco_aparejos.wav');
    //play the song resource
    player.play(resource);
    connection.subscribe(player);
}

