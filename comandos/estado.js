module.exports = {
    name: 'estado',
    aliases: [],
    description: 'Funcion para cambiar el estado del bot',
    execute(message, args, cmd, client, Discord, profileData) {
        return;
        console.log("INICIO ESTADO");
        if (message.content.split("\"").length != 3) {
            metodosUtiles.insultar(message);
            console.log("FIN ESTADO");
            return;
        }
        var estado_personalizado = message.content.split("\"")[1];
        switch (args[0]) {
            case "ocupado":
                args[0] = "dnd";
                break;
            case "invisible":
                args[0] = "invisible";
                break;
            case "ausente":
                args[0] = "idle";
                break;
            case "online":
                args[0] = "online";
                break;
            default:
                insultar(message);
                console.log("FIN ESTADO");
                return;
        }
        switch (args[1]) {
            case "viendo":
                args[1] = "WATCHING";
                break;
            case "escuchando":
                args[1] = "LISTENING";
                break;
            case "jugando":
                args[1] = "PLAYING";
                break;
            case "compitiendo":
                args[1] = "COMPETING";
                break;
            default:
                insultar(message);
                console.log("FIN ESTADO");
                return;
        }
        client.user.setPresence({
            status: args[0],
            activity: {
                name: estado_personalizado,
                type: args[1]
            }
        });
        message.delete();
        console.log("FIN ESTADO");
    }
}