const { getQueue } = require('../lib/queueManager');

module.exports = function handleStop(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    queue.songs = [];
    queue.current = null;
    queue.player.stop();
    message.reply('Cola vaciada y desconectado.');
};
