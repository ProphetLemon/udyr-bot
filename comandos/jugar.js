const {tictactoe} = require('reconlx');
module.exports = {
    name: 'jugar',
    aliases: [],
    description: 'Funcion para jugar al tres en raya',
    async execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO JUGAR");
        const member = message.mentions.members.first();
        if (!member) return metodosUltiles.insultar(message);
        new tictactoe({
            player_two:member,
            message:message
        })
        message.delete();
        console.log("FIN JUGAR");
    }
}