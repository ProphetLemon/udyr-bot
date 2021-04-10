const { Discord } = require("discord.js")

module.exports = {
    name: 'comandos',
    aliases: [],
    description: "Mi propio commando embed",

    /**
    * 
    * @param {Discord} Discord
     * @param {Message} message
     * @param {string[]} args
     */
    execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO COMANDOS");
        const newEmbed = new Discord.MessageEmbed()
            .setColor("#B17428")
            .setTitle("Comandos")
            .setDescription('Comandos del server')
            .addFields(
                { name: 'udyr hacienda _numero_', value: 'Te calcula lo que te quita hacienda en funcion del numero que le pases' },
                { name: 'udyr top/jung/mid/adc/supp', value: 'Te dice un champ correspondiente a esa linea' },
                { name: 'udyr autofill', value: 'Te dice un champ aleatorio en una linea que le corresponda' },
                { name: 'udyr random', value: 'Te dice un champ aleatorio en una linea aleatoria' },
                { name: `udyr apuesta _"nombre de apuesta"_ _"nombre bando 1"_ _"nombre bando 2"_`, value: 'Crea una apuesta ' },
                { name: `udyr apostar _"nombre bando"_ _cantidad-a-apostar_`, value: 'Apuestas a un bando' },
                { name: `udyr cerrar _"nombre bando"_`, value: 'Se cierra y se declara al ganador y se reparten los puntos' },
                { name: 'udyr dado _numero-de-caras_ _numero-de-tiradas_', value: 'Tira tantos dados como quieras, y esos dados pueden tener a su vez el numero de caras que quieras' },
                { name: 'udyr moneda', value: 'Te dice cara o cruz' },
                { name: 'udyr estado (_online/ausente/ocupado_) (_viendo/jugando/compitiendo/escuchando_) (_"estado-personalizado-que-escribas"_)', value: 'Personalizas el estado del bot' },
                { name: 'udyr alarma (_hoy_/_ma\u00F1ana_/_dia-personalizado_) (_hora-personalizada_)', value: 'Crea una alarma (por motivos ajenos al bot se recomienda poner alarmas que se ejecuten el mismo dia)' },
                { name: 'udyr focus', value: 'Hace focus a alguien y el bot no para de insultarle cuando habla' },
                { name: `udyr puntos`, value: `Canjea los puntos diarios y/o muestra los puntos que tienes` },
                { name: `udyr regalar _persona_ _cantidad_`, value: `Regalas puntos tuyos a otra personas` },
                { name: 'udyr limpiar _numero-de-mensajes_', value: 'Quita el focus o si metes un numero borrar esa cantidad de mensajes en el canal' },
                { name: 'udyr comandos', value: 'Te manda un mensaje con todos los comandos' },
                { name: 'udyr pelea _"persona-1"_ _"persona-2"_', value: 'Simula una pelea entre dos personas' },
                { name: 'udyr retar _persona_', value: 'Retas a una persona' },
                { name: 'udyr coliseo', value: 'Simula una pelea entre dos personas del server' }
            )
            .setImage('https://i.kym-cdn.com/entries/icons/facebook/000/034/006/uga.jpg')
            .setFooter('Ser malos! Buenas noches colegas\nPerro Xanchez - 19/11/10');
        message.channel.send(newEmbed);
        console.log("FIN COMANDOS");
    }
}
