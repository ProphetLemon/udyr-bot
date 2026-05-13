module.exports = function handleHelp(message) {
    message.reply(
        '**Comandos disponibles:**\n' +
        '\n`udyr yt <url>` - Reproduce una URL de YouTube o playlist' +
        '\n`udyr yt <busqueda>` - Busca en YouTube y te deja elegir' +
        '\n`udyr pause` - Pausa la reproduccion' +
        '\n`udyr resume` - Reanuda la reproduccion' +
        '\n`udyr skip` - Salta la cancion actual' +
        '\n`udyr stop` - Detiene todo y desconecta' +
        '\n`udyr queue` - Muestra la cola' +
        '\n`udyr clean <num>` - Borra los ultimos <num> mensajes' +
        '\n`udyr lol <campeon> <linea> [build#]` - Screenshot de build de u.gg' +
        '\n`udyr lol equipo` - Asigna champs y lineas a tu canal de voz' +
        '\n`udyr retar @usuario` - Duelo por turnos con clases, stats, pasivas, combos y muerte subita' +
        '\n`udyr ruleta` - Tragaperras de frutas con patrones y multiplicadores' +
        '\n`udyr blackjack` - Blackjack contra el dealer' +
        '\n`udyr ppt @usuario` - Piedra, papel o tijera 1v1' +
        '\n`udyr dados` - Craps: tira los dados contra la casa' +
        '\n`udyr mayor` - Mayor o menor: adivina la siguiente carta' +
        '\n`udyr carrera` - Apuesta a caballos y mira la carrera' +
        '\n`udyr conecta4 @usuario` - Conecta 4 por turnos' +
        '\n`udyr help` / `udyr h` - Muestra esta ayuda'
    );
};
