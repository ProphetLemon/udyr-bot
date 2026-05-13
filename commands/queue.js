const { getQueue } = require('../lib/queueManager');

module.exports = function handleQueue(message) {
    const queue = getQueue(message.guild.id);
    if (!queue || (!queue.current && queue.songs.length === 0)) {
        return message.reply('La cola esta vacia.');
    }

    const lines = [];
    if (queue.current) {
        lines.push(`**Sonando ahora:** ${queue.current.title} \`[${queue.current.duration}]\``);
    }
    if (queue.songs.length > 0) {
        lines.push('**En cola:**');
        queue.songs.forEach((s, i) => {
            lines.push(`**${i + 1}.** ${s.title} \`[${s.duration}]\``);
        });
    } else {
        lines.push('**En cola:** (vacia)');
    }

    const pages = [];
    let current = '';
    for (const line of lines) {
        if (current.length + line.length + 1 > 2000) {
            pages.push(current);
            current = line;
        } else {
            current += (current ? '\n' : '') + line;
        }
    }
    if (current) pages.push(current);

    for (const page of pages) {
        message.channel.send(page).catch(() => {});
    }
};
