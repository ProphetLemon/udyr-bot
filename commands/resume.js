const { AudioPlayerStatus } = require('@discordjs/voice');
const { getQueue } = require('../lib/queueManager');

module.exports = function handleResume(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    if (queue.player.state.status === AudioPlayerStatus.Paused) {
        queue.player.unpause();
        message.reply('Reanudado.');
    } else {
        message.reply('No esta pausado.');
    }
};
