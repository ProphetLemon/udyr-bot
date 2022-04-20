const { Discord, MessageEmbed, Message } = require("discord.js")

module.exports = {
    name: 'comandos',
    aliases: ['help', 'ayuda'],
    description: "Mi propio commando embed",

    /**
    * 
    * @param {Discord} Discord
     * @param {Message} message
     * @param {string[]} args
     */
    execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO COMANDOS");
        const newEmbed = new MessageEmbed()
            .setColor("#B17428")
            .setTitle("Comandos")
            .setDescription('Comandos del server')
            .addFields(
                { name: 'udyr top/jung/mid/adc/supp', value: 'Te dice un champ correspondiente a esa linea' },
                { name: 'udyr autofill', value: 'Te dice un champ aleatorio en una linea que le corresponda' },
                { name: 'udyr random', value: 'Te dice un champ aleatorio en una linea aleatoria' },
                { name: 'udyr dado _numero-de-caras_ _numero-de-tiradas_', value: 'Tira tantos dados como quieras, y esos dados pueden tener a su vez el numero de caras que quieras' },
                { name: 'udyr moneda', value: 'Te dice cara o cruz' },
                { name: 'udyr focus', value: 'Hace focus a alguien y el bot no para de insultarle cuando habla' },
                { name: `udyr puntos`, value: `Canjea los puntos diarios y/o muestra los puntos que tienes` },
                { name: `udyr regalar/donar _persona_ _cantidad_`, value: `Regalas puntos tuyos a otra personas` },
                { name: 'udyr limpiar _numero-de-mensajes_', value: 'Quita el focus o si metes un numero borrar esa cantidad de mensajes en el canal' },
                { name: 'udyr comandos/help', value: 'Te manda un mensaje con todos los comandos' },
                { name: 'udyr retar _persona_', value: 'Retas a una persona' },
                { name: 'udyr ranking', value: 'Ves el ranking del servidor' },
                { name: 'udyr robar', value: 'Robas a alguien random de los 5 con mas monedas del servidor' },
                { name: 'udyr juicio _persona_', value: 'Si alguien te roba usas este comando para acusar a alguien y recuperar el dinero (si aciertas, sino pierdes tu)' },
                { name: 'udyr wordle _palabra de 5 letras_', value: 'Haces el wordle de hoy' },
                { name: 'udyr valorant', value: 'Te forma un equipo de valorant con la gente que hay en el chat de voz' },
                { name: 'udyr centinela/iniciador/duelista/controlador', value: 'Te dice un agente del valorant en funcion del tipo que has puesto' },
                { name: 'udyr play _nombre de la cancion_', value: 'Pone musica en el chat de voz (solo funciona en <#888550185616166922>)' },
                { name: 'udyr stop/skip', value: 'Controles para la musica (solo funciona en <#888550185616166922>)' },
                { name: 'udyr elegir \"_opcion 1_\" \"_opcion 2_\"', value: 'El bot elige entre 2 o mas opciones' },
                { name: 'udyr tiempo _ciudad_', value: 'El bot te dice el tiempo de la ciudad dada' },
            )
            .setImage('https://i.kym-cdn.com/entries/icons/facebook/000/034/006/uga.jpg')
            .setFooter({ text: 'Ser malos! Buenas noches colegas\nPerro Xanchez - 19/11/10' });
        message.channel.send({ embeds: [newEmbed] });
        console.log("FIN COMANDOS");
    }
}
