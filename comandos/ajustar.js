module.exports = {
    name: 'ajustar',
    aliases: [],
    description: 'Funcion para ajustar las horas en el server',
    execute(message, args, cmd, client, Discord, profileData) {
        console.log(`INICIO ${cmd.toUpperCase()}`)
        let hora = args[0];
        if (!metodosUtiles.isValidNumber(hora)) {
            metodosUtiles.insultar(message);
            console.log(`FIN ${cmd.toUpperCase()}`);
            return;
        }
        let dtServer = new Date();
        let dtCliente = new Date();
        dtCliente.setHours(hora);
        horasDiferencia = dtServer.getHours() - dtCliente.getHours();
        message.channel.send("La diferencia de horas es de " + horasDiferencia);
        console.log(`FIN ${cmd.toUpperCase()}`);
    }
}