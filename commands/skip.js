const { getQueue } = require('../lib/queueManager');

module.exports = function handleSkip(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    if (!queue.current && queue.songs.length === 0) {
        return message.reply('No hay nada en la cola.');
    }
    message.reply(`Saltando: **${queue.current?.title || 'desconocido'}**`);
    queue.player.stop();
};
