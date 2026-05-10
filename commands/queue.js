const { getQueue } = require('../lib/queueManager');

module.exports = function handleQueue(message) {
    const queue = getQueue(message.guild.id);
    if (!queue || (!queue.current && queue.songs.length === 0)) {
        return message.reply('La cola esta vacia.');
    }
    let text = '';
    if (queue.current) {
        text += `**Sonando ahora:** ${queue.current.title} \`[${queue.current.duration}]\`\n\n`;
    }
    if (queue.songs.length > 0) {
        text += '**En cola:**\n';
        queue.songs.forEach((s, i) => {
            text += `\n**${i + 1}.** ${s.title} \`[${s.duration}]\``;
        });
    } else {
        text += '**En cola:** (vacia)';
    }
    message.reply(text);
};
