const { Message, Client, GuildMember } = require("discord.js")
const Discord = require("discord.js");
class Carta {
    /**
     * 
     * @param {string} tipo 
     * @param {{}} palabras 
     */
    constructor(tipo, palabras) {
        this.palabras = palabras
        this.tipo = tipo
    }
    /**
     * 
     * @param {number} repeticiones
     */
    createCopy(repeticiones) {
        let cartas = []
        for (let i = 0; i < repeticiones; i++) {
            cartas.push(new Carta(this.tipo, this.palabras))
        }
        return cartas;
    }

    imprimir() {
        if (this.tipo == ROLES.PERIODISTA) {
            return `Eres el **${ROLES.PERIODISTA.toUpperCase()}**, te toca intentar adivinar de que están hablando los demás y aguantar lo máximo posible.\n` +
                `Si te pillan y te eliminan tienes opción a adivinar la palabra y decirla en voz alta, **${"si aciertas ganas la partida.".toUpperCase()}**`
        }
        return `1:${this.palabras[1]} 2:${this.palabras[2]} 3:${this.palabras[3]} 4:${this.palabras[4]} 5:${this.palabras[5]}\n6:${this.palabras[6]} 7:${this.palabras[7]} 8:${this.palabras[8]} 9:${this.palabras[9]} 10:${this.palabras[10]} `
    }
}
class Mision {
    /**
     * 
     * @param {string} nombre 
     * @param {Carta} cartaDiscipulo
     * @param {Carta} cartaInfiltrado
     */
    constructor(nombre, cartaDiscipulo, cartaInfiltrado) {
        this.nombre = nombre;
        this.cartaDiscipulo = cartaDiscipulo;
        this.cartaInfiltrado = cartaInfiltrado;
    }
}

class Jugador {
    /**
     * 
     * @param {GuildMember} member 
     * @param {Carta} carta 
     */
    constructor(member, carta) {
        this.member = member;
        this.carta = carta
        this.votos = 0
        this.votar = false
    }
}

const ROLES = { INFILTRADO: "Infiltrado", DISCIPULO: "Discípulo", PERIODISTA: "Periodista" }

const MISIONES = [
    new Mision("HOGWARTS",
        new Carta(ROLES.DISCIPULO, {
            1: "Mago", 2: "Walkie Talkie", 3: "Taburete", 4: "Boda", 5: "Gorra",
            6: "Cuervo", 7: "Foto", 8: "Ovni", 9: "Tornado", 10: "Abejorro"
        }),
        new Carta(ROLES.INFILTRADO, {
            1: "Bruja", 2: "Teléfono", 3: "Sillón", 4: "Bautizo", 5: "Sombrero",
            6: "Cigüeña", 7: "Cuadro", 8: "Cohete", 9: "Trueno", 10: "Avispa"
        })),

    new Mision("MÉXICO",
        new Carta(ROLES.DISCIPULO, {
            1: "Bigote", 2: "Ladrillo", 3: "Lentejas", 4: "Ceja", 5: "Tienda",
            6: "Océano", 7: "Escoba", 8: "Monedero", 9: "Examen", 10: "Uniforme"
        }),
        new Carta(ROLES.INFILTRADO, {
            1: "Barba", 2: "Cemento", 3: "Guisantes", 4: "Pestaña", 5: "Mercado",
            6: "Mar", 7: "Plumero", 8: "Cuenta bancaria", 9: "Notas", 10: "Disfraz"
        })),

    new Mision("PAÍS DE NUNCA JAMÁS",
        new Carta(ROLES.DISCIPULO, {
            1: "Hada", 2: "Zombie", 3: "Planta", 4: "Alumno", 5: "Goma",
            6: "Caramelo", 7: "Cama", 8: "Aspiradora", 9: "Brújula", 10: "Uva"
        }),
        new Carta(ROLES.INFILTRADO, {
            1: "Duende", 2: "Fantasma", 3: "Hoja", 4: "Profesor", 5: "Tipex",
            6: "Bombón", 7: "Sofá", 8: "Escoba", 9: "GPS", 10: "Aceituna"
        })),

    new Mision("HONG KONG",
        new Carta(ROLES.DISCIPULO, {
            1: "Koala", 2: "Tacones", 3: "Cebolla", 4: "Galaxia", 5: "Amor",
            6: "Aire acondicionado", 7: "Cueva", 8: "Pasta de dientes", 9: "Semillas", 10: "Carta"
        }),
        new Carta(ROLES.INFILTRADO, {
            1: "Panda", 2: "Zapatillas", 3: "Ajo", 4: "Atmósfera", 5: "Obsesión",
            6: "Ventilador", 7: "Túnel", 8: "Enjuague bucal", 9: "Raíces", 10: "Email"
        })),

    new Mision("ANTÁRTIDA",
        new Carta(ROLES.DISCIPULO, {
            1: "Oso polar", 2: "Pistola", 3: "Reloj", 4: "Terciopelo", 5: "Hielo",
            6: "Cicatriz", 7: "Humano", 8: "Canoa", 9: "Hospital", 10: "Cocinero"
        }),
        new Carta(ROLES.INFILTRADO, {
            1: "Pingüino", 2: "Escopeta", 3: "Cronómetro", 4: "Algodón", 5: "Nieve",
            6: "Marca de nacimiento", 7: "Marciano", 8: "Bote", 9: "Asilo", 10: "Camarero"
        })
    ),

    new Mision("TOKIO",
        new Carta(ROLES.DISCIPULO, {
            1: "Youtube", 2: "Tenis", 3: "Mermelada", 4: "Caja fuerte", 5: "Asesino",
            6: "Crema hidratante", 7: "Juego de mesa", 8: "Cantina", 9: "Pelusa", 10: "Rock n'roll"
        }),
        new Carta(ROLES.INFILTRADO, {
            1: "Netflix", 2: "Ping Pong", 3: "Mantequilla", 4: "Candado", 5: "Terrorista",
            6: "Protección Solar", 7: "Videojuego", 8: "Restaurante", 9: "Polvo", 10: "Hip Hop"
        }))
]

const partidas = new Map();

module.exports = {
    name: 'littlesecrets',
    aliases: ['ls'],
    description: 'Funcion para jugar a Little Secrets',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {Discord} Discord 
     * @param {*} profileData 
     */
    execute(message, args, cmd, client, Discord, profileData) {
        if (!message.member || !message.member.voice.channel) return message.channel.send("Tienes que estar en un chat de voz").then(msg => {
            message.delete();
            setTimeout(() => {
                msg.delete();
            }, 5000);
        })
        if (message.member.voice.channel.members.size < 3) return message.channel.send("No sois suficientes jugadores, teneis que ser al menos 3").then(msg => {
            message.delete()
            setTimeout(() => {
                msg.delete()
            }, 5000);
        });
        var comando = args[0];
        if (comando == "votar") {
            if (!partidas.get(message.guildId)) return message.channel.send("No hay partida activa")
            if (message.mentions.members.size == 0) return message.channel.send("Tienes que mencionar a alguien")
            var jugadores = getPartida(message);
            var jugadorMensaje = getJugador(message);
            if (!jugadorMensaje) return message.reply("A ti nadie te invitó").then(msg => {
                message.react("🐻")
                message.react("🖕")
                setTimeout(() => {
                    message.delete()
                    msg.delete()
                }, 5000);
            })
            if (jugadorMensaje.votar = true) return message.reply("Ya votaste")
            var mencion = message.mentions.members.first()
            for (let jugador of jugadores) {
                if (jugador.member.id == mencion.id) {
                    jugador.votos = jugador.votos + 1                    
                    jugadorMensaje.votar = true                    
                    break;
                }
            }
        }
    }
}

/**
 * 
 * @param {Message} message 
 * @param {Jugador|undefined}
 */
function getJugador(message) {
    var jugadores = getPartida(message)
    for (let jugador of jugadores) {
        if (jugador.member.id == message.member.id) {
            return jugador
        }
    }
    return undefined
}

/**
 * 
 * @param {Message} message 
 * @return {Jugador[]} 
 */
function getPartida(message) {
    let { guildId, channel } = message
    if (!partidas.get(guildId)) {
        var members = message.member.voice.channel.members
        var jugadores = []
        var mision = MISIONES[Math.floor(Math.random() * MISIONES.length)]
        for (let [id, member] of members) {
            if (!member.user.bot) {
                jugadores.push(new Jugador(member))
            }
        }
        var cartas = []
        switch (jugadores.length) {
            case 3:
                cartas = cartas.concat(mision.cartaDiscipulo.createCopy(2)).concat(mision.cartaInfiltrado)
                break;
            case 4:
                cartas = cartas.concat(mision.cartaDiscipulo.createCopy(3)).concat(mision.cartaInfiltrado)
                break;
            case 5:
                cartas = cartas.concat(mision.cartaDiscipulo.createCopy(3)).concat(mision.cartaInfiltrado).concat(new Carta(ROLES.PERIODISTA))
                break;
            case 6:
                cartas = cartas.concat(mision.cartaDiscipulo.createCopy(4)).concat(mision.cartaInfiltrado).concat(new Carta(ROLES.PERIODISTA))
                break;
            case 7:
                cartas = cartas.concat(mision.cartaDiscipulo.createCopy(4)).concat(mision.cartaInfiltrado.createCopy(2)).concat(new Carta(ROLES.PERIODISTA))
                break;
            case 8:
                cartas = cartas.concat(mision.cartaDiscipulo.createCopy(5)).concat(mision.cartaInfiltrado.createCopy(2)).concat(new Carta(ROLES.PERIODISTA))
                break;
            case 9:
                cartas = cartas.concat(mision.cartaDiscipulo.createCopy(5)).concat(mision.cartaInfiltrado.createCopy(3)).concat(new Carta(ROLES.PERIODISTA))
                break;
        }
        cartas = shuffle(cartas)
        for (let i = 0; i < jugadores.length; i++) {
            jugadores[i].carta = cartas.splice(0, 1)[0];
        }
        partidas.set(guildId, jugadores)
    }
    return partidas.get(guildId);
}

/**
 * 
 * @param {Carta[]} array 
 * @returns {Carta[]}
 */
function shuffle(array) {
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