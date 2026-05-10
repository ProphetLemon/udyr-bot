const { AudioPlayerStatus } = require('@discordjs/voice');
const { getQueue } = require('../lib/queueManager');

module.exports = function handlePause(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    if (queue.player.state.status === AudioPlayerStatus.Playing) {
        queue.player.pause();
        message.reply('Pausado.');
    } else {
        message.reply('Ya esta pausado o no esta sonando.');
    }
};
