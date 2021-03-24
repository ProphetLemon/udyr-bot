module.exports = {
    name: 'ajustar',
    aliases: [],
    description: 'Funcion para ajustar las horas en el server',
    execute(client, message, args, cmd) {
    let hora = message.content.split(/ +/)[2];
    if (!metodosUtiles.isValidNumber(hora)) {
        metodosUtiles.insultar(message);
        return;
    }
    let dtServer = new Date();
    let dtCliente = new Date();
    dtCliente.setHours(hora);
    horasDiferencia = dtServer.getHours() - dtCliente.getHours();
    message.channel.send("La diferencia de horas es de " + horasDiferencia);
    }
}