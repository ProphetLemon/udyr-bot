module.exports = {
    name: 'moneda',
    aliases: [],
    description: 'Funcion para crear apuestas o apostar en ellas',
    execute(client, message, args, cmd) {
        message.reply(Math.floor(Math.random() * 2) == 0 ? "cara" : "cruz");
    }
}