module.exports = {
    name:'changelog',
    description:'Descripcion de los cambios con el ultimo parche',
    execute(client,message, args,cmd) {
        var mensaje = "Estoy en la versi\u00F3n " + version + "\n\n";
        mensaje += "Cambios m\u00E1s recientes:\n" +
            "\u25CF Se ha a\u00F1adido el comando 'retar'.\n" +
            "\u25CF Se ha cambiado el antiguo metedo de 'pelea' al de 'retar.\n" +
            "\u25CF El comando 'pelea' ahora es para escribir entre comillas y por separado el nombre de dos personas o personajes para que se peguen.\n|n" +
            "Cambios con la versi\u00F3n 11:\n" +
            "\u25CF Se ha a\u00F1adido el comando 'retar' en la lista de comandos que aparece al ejecutar 'comandos'.\n" +
            "\u25CF Se ha a\u00F1adido el comando 'retar'\n" +
            "\u25CF Se ha a\u00F1adido el comando 'pelea' en la lista de comandos que aparece al ejecutar 'comandos'.\n" +
            "\u25CF Se ha a\u00F1adido el comando 'pelea'\n"
        message.channel.send(mensaje);        
    }

}