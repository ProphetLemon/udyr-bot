const { Message, Client, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');
const Pokedex = require("pokeapi-js-wrapper")
const P = new Pokedex.Pokedex({ cache: false })
const Canvas = require('canvas');
const { Image } = require('canvas');
module.exports = {
    name: 'pokemon',
    aliases: ['poke', 'pokedex'],
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
        return;
        return;
        console.log(`INICIO ${cmd.toUpperCase()}`)
        //AQUI REVISO SI LO HACES EN EL CANAL DE POKEMON O POR PRIVADO
        if ((message.channel.id == "974244009100857405" || message.guild == undefined) == false) {
            message.channel.send("Esto mejor en el canal de pokemon").then(msg => {
                message.delete()
                setTimeout(() => {
                    msg.delete()
                }, 5000);
            })
            console.log(`FIN ${cmd.toUpperCase()}`)
            return
        }
        //AQUI MANDO UN MENSAJE DE 'CARGANDO POKEMON' QUE LO ELIMINO CUANDO GENERO LA FOTO
        var mensajeABorrar = await message.channel.send("Cargando pokemon...")
        //AQUI BUSCO EL POKEMON Y SINO EXISTE TE LO HAGO SABER
        try {
            var pokemon = await P.getPokemonByName(args.join("-").split(":").join("").split("_").join("-").toLowerCase())
        } catch (err) {
            mensajeABorrar.delete()
            console.log(`FIN ${cmd.toUpperCase()}`)
            return message.reply("Escribe bien hijo de puta")
        }
        //AQUI COJO LAS EVOLUCIONES DEL POKEMON Y SI FALLA ES PORQUE SEGURAMENTE SE UNA VERSION TIPO ALOLA O DERIVADOS ASI QUE TE DEVUELVO LAS EVOLUCIONES DEL POKEMON BASE
        var evoluciones = ""
        try {
            evoluciones = await getEvoluciones(pokemon.name)
        }
        catch (err) {
            evoluciones = await getEvoluciones(pokemon.name.split("-")[0])
        }

        //AQUI RECOJO TODO LOS STATS BASE Y LA SUMA DE TODOS ELLOS
        var bst = 0
        var bsm = ""
        for (let i = 0; i < pokemon.stats.length; i++) {
            bsm += `${getEmojiByStat(pokemon.stats[i].stat.name)}: ${pokemon.stats[i].base_stat}\n`
            bst += pokemon.stats[i].base_stat
        }
        //AQUI INICIALIZO EL MAPA CON LAS DEBILIDADES
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
        //AQUI RECORRO LOS TIPOS DEL POKEMON QUE HAS BUSCADO (1-2) Y MODIFICO EL MAPA 'DEBILIDADES' EN FUNCION DE LA RELACION DE DAÑO QUE RECIBE EL POKEMON SELECCIONADO
        var tipos = pokemon.types
        for (let i = 0; i < tipos.length; i++) {
            var tipo = await P.getTypeByName(tipos[i].type.name)
            comprobarArrays(tipo.damage_relations.double_damage_from, debilidades, 2)
            comprobarArrays(tipo.damage_relations.half_damage_from, debilidades, 1 / 2)
            comprobarArrays(tipo.damage_relations.no_damage_from, debilidades, 0)
        }
        //AQUI RECORRO EL MAP PARA CLASIFICAR LAS DEBILIDADES DEL POKEMON Y APARTE TRADUZCO LOS TIPOS
        var quadra = []
        var double = []
        var neutral = []
        var half = []
        var doublehalf = []
        var inmune = []
        for (var [key, value] of debilidades) {
            var traduccion = await P.getTypeByName(key)
            key = traduccion.names[5].name
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
        //A PARTIR DE AQUI FORMO LO QUE ES EL EMBED Y LA FOTO
        //EN ESTA LINEA DETERMINO SI EL SPRITE QUE VA SALIR ES SHINY O NO
        var shiny = Math.floor(Math.random() * 255) + 1 == 255 ? true : false
        var newEmbed = new EmbedBuilder();
        newEmbed.setAuthor({
            name: `${shiny ? "✨" : ""}${pokemon.name.toUpperCase()}${shiny ? "✨" : ""}`
        })
        //AQUI AÑADO LAS EVOLUCIONES
        newEmbed.setDescription(evoluciones)
        newEmbed.setColor("00FBFF")
        //AQUI INSERTO TANTO LAS DEBILIDADES COMO LOS STAT BASE
        newEmbed.addFields(
            { name: ":skull: (x4)", value: `${quadra.length > 0 ? quadra.join("\n") : '\u200B'}`, inline: true },
            { name: ":face_with_spiral_eyes: (x2)", value: `${double.length > 0 ? double.join("\n") : '\u200B'}`, inline: true },
            { name: "Stats", value: `${bsm}**Total: ${bst}**`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: ":sunglasses: (x0.5)", value: `${half.length > 0 ? half.join("\n") : '\u200B'}`, inline: true },
            { name: ":joy: (x0.25)", value: `${doublehalf.length > 0 ? doublehalf.join("\n") : '\u200B'}`, inline: true },
            { name: ":yawning_face: (x0)", value: `${inmune.length > 0 ? inmune.join("\n") : '\u200B'}`, inline: true },
        )

        const canvas = Canvas.createCanvas(100 * 2, 110 * 2);
        const context = canvas.getContext('2d');
        //MEMES
        if (pokemon.name == "vaporeon") {
            const background = await Canvas.loadImage('./images/vaporeon.png');

            context.drawImage(background, -140, 0)
        }
        if (pokemon.name == "dragonite") {
            const background = await Canvas.loadImage('./images/espana.png');

            context.drawImage(background, -70, 0)
        }
        const pokemonSprite = new Image()
        pokemonSprite.onload = function () {
            context.drawImage(pokemonSprite, 20, 0, 98 * 1.75, 98 * 1.75);
            var tipo1 = new Image()
            if (pokemon.types.length == 1) {
                tipo1.onload = function () {
                    context.drawImage(tipo1, 31 * 2.3, 90 * 2, 32 * 1.75, 14 * 1.75)
                    const attachment = new AttachmentBuilder(canvas.toBuffer());
                    attachment.setName('pokemon.png')
                    newEmbed.setImage("attachment://pokemon.png")
                    mensajeABorrar.delete()
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
                        const attachment = new AttachmentBuilder(canvas.toBuffer());
                        attachment.setName('pokemon.png')
                        newEmbed.setImage("attachment://pokemon.png")
                        mensajeABorrar.delete()
                        message.channel.send({ embeds: [newEmbed], files: [attachment] })
                    }
                    tipo2.src = getLinkByTipo(pokemon.types[1].type.name)
                }
                tipo1.src = getLinkByTipo(pokemon.types[0].type.name)
            }

        }
        pokemonSprite.src = `${shiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default == null ? pokemon.sprites.other["official-artwork"].front_default : pokemon.sprites.front_default}`
        console.log(`FIN ${cmd.toUpperCase()}`)
    }

}
/**
 * Funcion que que recorro un array en el cual aparecen un listado de tipos de pokemon y en funcion del parametro
 * 'damage' multiplico su valor en el mapa de debilidades del pokemon
 * @param {string[]} arrayAComprobar array con los tipos que iterracionan con el pokemon
 * @param {Map} debilidades mapa de las relaciones de daño del pokemon con todos los tipos
 * @param {Number} damage relacion del daño que recibe el pokemon en funcion del array
 */
function comprobarArrays(arrayAComprobar, debilidades, damage) {
    for (let i = 0; i < arrayAComprobar.length; i++) {
        var valorInicial = debilidades.get(arrayAComprobar[i].name)
        debilidades.set(arrayAComprobar[i].name, valorInicial * damage)
    }
}
/**
 * Funcion que recoge todas las evoluciones del pokemon que se le pasa por parametro
 * @param {String} name Nombre del pokemon
 * @returns String con las evoluciones
 */
async function getEvoluciones(name) {
    var pokemonSpecies = await P.getPokemonSpeciesByName(name)
    var pokemonEvolutionChain = await P.resource(pokemonSpecies.evolution_chain.url)
    var primeraEvolucion = pokemonEvolutionChain.chain.species.name
    var segundaEvolucion = ""
    for (let i = 0; i < pokemonEvolutionChain.chain.evolves_to.length; i++) {
        let evolution = pokemonEvolutionChain.chain.evolves_to[i]
        segundaEvolucion += `${evolution.species.name}/`
    }
    segundaEvolucion = segundaEvolucion == "" ? "" : " -> " + segundaEvolucion.substring(0, segundaEvolucion.length - 1)
    var terceraEvolucion = ""
    for (let i = 0; i < pokemonEvolutionChain.chain.evolves_to.length; i++) {
        let evolution = pokemonEvolutionChain.chain.evolves_to[i]
        if (evolution.evolves_to.length > 0) {
            for (let j = 0; j < evolution.evolves_to.length; j++) {
                terceraEvolucion += evolution.evolves_to[j].species.name + "/"
            }
        }
    }
    terceraEvolucion = terceraEvolucion == "" ? "" : " -> " + terceraEvolucion.substring(0, terceraEvolucion.length - 1)
    var evoluciones = primeraEvolucion + segundaEvolucion + terceraEvolucion
    evoluciones = evoluciones.split(name).join(`**${name}**`)
    return evoluciones
}
/**
 * Funcion simple que en base al nombre de un stat te devuelve la traduccion y emojis representativos
 * @param {string} stat 
 * @returns 
 */
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
/**
 * Funcion que en base a un string que define el tipo del pokemon devuelve el link a la foto del tipo especificado
 * @param {string} tipo 
 * @returns link del tipo de pokemon
 */
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