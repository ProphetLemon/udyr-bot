const { Message, Client, MessageAttachment, MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const Pokedex = require("pokeapi-js-wrapper")
const P = new Pokedex.Pokedex({ cache: false })
const Canvas = require('canvas');
const { Image } = require('canvas');
module.exports = {
    name: 'pokemon',
    aliases: ['poke'],
    description: 'Funcion que te da las debilidades y fortalezas de un pokemon',
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
        try {
            var pokemon = await P.getPokemonByName(args.join("-").split(":").join("").toLowerCase())
        } catch (err) {
            return message.reply("Escribe bien hijo de puta")
        }
        var tipos = pokemon.types
        var debilidades = new Map()
        debilidades.set("normal", 1)
        debilidades.set("fighting", 1)
        debilidades.set("flying", 1)
        debilidades.set("poison", 1)
        debilidades.set("ghost", 1)
        debilidades.set("water", 1)
        debilidades.set("ice", 1)
        debilidades.set("fire", 1)
        debilidades.set("grass", 1)
        debilidades.set("ground", 1)
        debilidades.set("rock", 1)
        debilidades.set("fairy", 1)
        debilidades.set("dark", 1)
        debilidades.set("psychic", 1)
        debilidades.set("steel", 1)
        debilidades.set("bug", 1)
        debilidades.set("electric", 1)
        debilidades.set("dragon", 1)
        var bst = 0
        var bsm = ""
        for (let i = 0; i < pokemon.stats.length; i++) {
            bsm += `${getEmojiByStat(pokemon.stats[i].stat.name)}: ${pokemon.stats[i].base_stat}\n`
            bst += pokemon.stats[i].base_stat
        }
        for (let i = 0; i < tipos.length; i++) {
            var tipo = await P.getTypeByName(tipos[i].type.name)
            comprobarArrays(tipo.damage_relations.double_damage_from, debilidades, 2)
            comprobarArrays(tipo.damage_relations.half_damage_from, debilidades, 1 / 2)
            comprobarArrays(tipo.damage_relations.no_damage_from, debilidades, 0)
        }
        var quadra = []
        var double = []
        var neutral = []
        var half = []
        var doublehalf = []
        var inmune = []
        for (var [key, value] of debilidades) {
            switch (value) {
                case 4:
                    quadra.push(key)
                    break;
                case 2:
                    double.push(key)
                    break;
                case 1:
                    neutral.push(key)
                    break;
                case 1 / 2:
                    half.push(key)
                    break;
                case 1 / 4:
                    doublehalf.push(key)
                    break;
                case 0:
                    inmune.push(key)
                    break;
            }
        }
        var shiny = Math.floor(Math.random() * 255) + 1 == 255 ? true : false
        var newEmbed = new MessageEmbed();
        newEmbed.setAuthor({
            name: `${pokemon.name.toUpperCase()}`
        })
        newEmbed.setColor("00FBFF")
        //newEmbed.setThumbnail(`${shiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default}`)        
        /* if (quadra.length > 0) {
             newEmbed.addField(":skull: (x4)", `${quadra.join(" ")}`)
         }
         if (double.length > 0) {
             newEmbed.addField(":face_with_spiral_eyes: (x2)", `${double.join(" ")}`)
         }
         if (half.length > 0) {
             newEmbed.addField(":sunglasses: (x0.5)", `${half.join(" ")}`)
         }
         if (doublehalf.length > 0) {
             newEmbed.addField(":joy: (x0.25)", `${doublehalf.join(" ")}`)
         }
         if (inmune.length > 0) {
             newEmbed.addField(":yawning_face: (x0)", `${inmune.join(" ")}`)
         }*/
        newEmbed.addFields(
            { name: ":skull: (x4)", value: `${quadra.length > 0 ? quadra.join("\n") : '\u200B'}`, inline: true },
            { name: ":face_with_spiral_eyes: (x2)", value: `${double.length > 0 ? double.join("\n") : '\u200B'}`, inline: true },
            { name: "Stats", value: `${bsm}**Total: ${bst}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: ":sunglasses: (x0.5)", value: `${half.length > 0 ? half.join("\n") : '\u200B'}`, inline: true },
            { name: ":joy: (x0.25)", value: `${doublehalf.length > 0 ? doublehalf.join("\n") : '\u200B'}`, inline: true },
            { name: ":yawning_face: (x0)", value: `${inmune.length > 0 ? inmune.join("\n") : '\u200B'}`, inline: true },
        )

        // message.reply({ embeds: [newEmbed] })


        // Create a 700x250 pixel canvas and get its context
        // The context will be used to modify the canvas
        const canvas = Canvas.createCanvas(100 * 2, 110 * 2);
        const context = canvas.getContext('2d');
        if (pokemon.name == "vaporeon") {
            const background = await Canvas.loadImage('./images/vaporeon.png');

            // This uses the canvas dimensions to stretch the image onto the entire canvas
            context.drawImage(background, -140, 0)
        }
        const pokemonSprite = new Image()
        pokemonSprite.onload = function () {
            // This uses the canvas dimensions to stretch the image onto the entire canvas
            context.drawImage(pokemonSprite, 20, 0, 98 * 1.75, 98 * 1.75);
            // Use the helpful Attachment class structure to process the file for you
            var tipo1 = new Image()
            if (pokemon.types.length == 1) {
                tipo1.onload = function () {
                    context.drawImage(tipo1, 31 * 2.3, 90 * 2, 32 * 1.75, 14 * 1.75)
                    const attachment = new MessageAttachment(canvas.toBuffer(), 'pokemon.png');
                    newEmbed.setImage("attachment://pokemon.png")
                    message.channel.send({ embeds: [newEmbed], files: [attachment] })
                }
                tipo1.src = getLinkByTipo(pokemon.types[0].type.name)
            }
            if (pokemon.types.length == 2) {
                tipo1.onload = function () {
                    context.drawImage(tipo1, 15 * 2, 90 * 2, 32 * 1.75, 14 * 1.75)
                    var tipo2 = new Image()
                    tipo2.onload = function () {
                        context.drawImage(tipo2, 58 * 2, 90 * 2, 32 * 1.75, 14 * 1.75)
                        const attachment = new MessageAttachment(canvas.toBuffer(), 'pokemon.png');
                        if (pokemon.name == "dragonite") {
                            newEmbed.setImage("https://areajugones.sport.es/wp-content/uploads/2022/02/leyendas-pokemon-arceus-1.jpg")
                            newEmbed.setThumbnail("attachment://pokemon.png")
                            message.channel.send({ embeds: [newEmbed], files: [attachment] })
                        } else {
                            newEmbed.setImage("attachment://pokemon.png")
                            message.channel.send({ embeds: [newEmbed], files: [attachment] })
                        }

                    }
                    tipo2.src = getLinkByTipo(pokemon.types[1].type.name)
                }
                tipo1.src = getLinkByTipo(pokemon.types[0].type.name)
            }

        }
        pokemonSprite.src = `${shiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default}`

    }
}
function comprobarArrays(arrayAComprobar, debilidades, damage) {
    for (let i = 0; i < arrayAComprobar.length; i++) {
        var valorInicial = debilidades.get(arrayAComprobar[i].name)
        debilidades.set(arrayAComprobar[i].name, valorInicial * damage)
    }
}
function getEmojiByStat(stat) {
    switch (stat) {
        case "hp":
            return "❤️ (PS)"
        case "attack":
            return "💪🏻 (Atq)"
        case "defense":
            return "🛡️ (Def)"
        case "special-attack":
            return "🧙🏻‍♂️ (At. Esp)"
        case "special-defense":
            return "🧊  (Def. Esp)"
        case "speed":
            return "♿ (Vel)"
    }
}
function getLinkByTipo(tipo) {
    var link
    switch (tipo) {
        case "steel":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/acero.gif'
            break;
        case "water":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/agua.gif'
            break;
        case "bug":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/bicho.gif'
            break;
        case "dragon":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/dragon.gif'
            break;
        case "electric":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/electrico.gif'
            break;
        case "normal":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/normal.gif'
            break;
        case "fighting":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/lucha.gif'
            break;
        case "flying":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/volador.gif'
            break;
        case "poison":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/veneno.gif'
            break;
        case "fairy":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/hada.gif'
            break;
        case "ice":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/hielo.gif'
            break;
        case "dark":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/siniestro.gif'
            break;
        case "rock":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/roca.gif'
            break;
        case "ground":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/tierra.gif'
            break;
        case "grass":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/planta.gif'
            break;
        case "ghost":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/fantasma.gif'
            break;
        case "fire":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/fuego.gif'
            break;
        case "psychic":
            link = 'https://www.pkparaiso.com/xy/sprites/tipos/psiquico.gif'
            break;
    }
    return link
}