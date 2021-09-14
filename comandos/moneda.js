module.exports = {
    name: 'moneda',
    aliases: [],
    description: 'Funcion para crear apuestas o apostar en ellas',
    execute(message,args,cmd,client,Discord,profileData) {
        console.log("INICIO MONEDA");
        message.reply(Math.floor(Math.random() * 2) == 0 ? "cara" : "cruz");
        console.log("FIN MONEDA");
    }
}