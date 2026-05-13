const { AudioPlayerStatus } = require('@discordjs/voice');
const { getQueue } = require('../lib/queueManager');

module.exports = async function handlePause(message) {
    const queue = getQueue(message.guild.id);
    if (!queue) return message.reply('No hay nada sonando.');
    if (queue.player.state.status === AudioPlayerStatus.Playing) {
        queue.player.pause();
        return message.reply('Pausado.');
    } else {
        return message.reply('Ya esta pausado o no esta sonando.');
    }
};
