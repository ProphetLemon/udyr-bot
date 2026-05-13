const MOVES = { '🪨': 'piedra', '📄': 'papel', '✂️': 'tijera' };
const BEATS = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' };
const TIMEOUT_MS = 30000;

module.exports = async function handlePpt(message, args) {
    const mentioned = message.mentions.users.first();
    if (!mentioned) {
        return message.reply('Menciona a alguien. Ejemplo: `udyr ppt @usuario`');
    }
    if (mentioned.id === message.author.id) {
        return message.reply('No puedes jugar contra ti mismo.');
    }
    if (mentioned.bot) {
        return message.reply('No puedes retar a un bot.');
    }

    const p1 = message.author;
    const p2 = mentioned;
    const picks = {};

    const embed = {
        color: 0x9b59b6,
        title: '🪨 📄 ✂️ Piedra, Papel o Tijera',
        description: `**${p1.toString()}** VS **${p2.toString()}**\n\nAmbos reaccionen con su jugada:\n🪨 Piedra\n📄 Papel\n✂️ Tijera\n\n${p1.toString()}: ❓\n${p2.toString()}: ❓`,
    };

    const msg = await message.channel.send({ embeds: [embed] });
    await msg.react('🪨').catch(() => {});
    await msg.react('📄').catch(() => {});
    await msg.react('✂️').catch(() => {});

    const filter = (reaction, user) => {
        return (user.id === p1.id || user.id === p2.id) &&
            Object.keys(MOVES).includes(reaction.emoji.name) &&
            !picks[user.id];
    };

    const collector = msg.createReactionCollector({ filter, time: TIMEOUT_MS, max: 2 });

    collector.on('collect', async (reaction, user) => {
        picks[user.id] = MOVES[reaction.emoji.name];
        reaction.users.remove(user.id).catch(() => {});

        const p1Text = picks[p1.id] ? `🪨📄✂️`.includes(picks[p1.id] === 'piedra' ? '🪨' : picks[p1.id] === 'papel' ? '📄' : '✂️') ? '' : '' : '❓';
        const p1Display = picks[p1.id] ? ({ piedra: '🪨', papel: '📄', tijera: '✂️' })[picks[p1.id]] : '❓';
        const p2Display = picks[p2.id] ? ({ piedra: '🪨', papel: '📄', tijera: '✂️' })[picks[p2.id]] : '❓';

        embed.description = `**${p1.toString()}** VS **${p2.toString()}**\n\nAmbos reaccionen con su jugada:\n🪨 Piedra\n📄 Papel\n✂️ Tijera\n\n${p1.toString()}: ${p1Display}\n${p2.toString()}: ${p2Display}`;
        await msg.edit({ embeds: [embed] }).catch(() => {});
    });

    collector.on('end', async () => {
        msg.reactions.removeAll().catch(() => {});

        const m1 = picks[p1.id];
        const m2 = picks[p2.id];

        if (!m1 && !m2) {
            embed.description = `Nadie eligió a tiempo. **Cancelado.**`;
            embed.color = 0x95a5a6;
        } else if (!m1) {
            embed.description = `${p1.toString()} no eligió a tiempo. ¡Gana **${p2.toString()}**!`;
            embed.color = 0xf1c40f;
        } else if (!m2) {
            embed.description = `${p2.toString()} no eligió a tiempo. ¡Gana **${p1.toString()}**!`;
            embed.color = 0xf1c40f;
        } else if (m1 === m2) {
            embed.description = `**${p1.toString()}:** ${({ piedra: '🪨', papel: '📄', tijera: '✂️' })[m1]}\n**${p2.toString()}:** ${({ piedra: '🪨', papel: '📄', tijera: '✂️' })[m2]}\n\n🤝 **EMPATE** — Ambos eligieron ${m1}.`;
            embed.color = 0x95a5a6;
        } else if (BEATS[m1] === m2) {
            embed.description = `**${p1.toString()}:** ${({ piedra: '🪨', papel: '📄', tijera: '✂️' })[m1]}\n**${p2.toString()}:** ${({ piedra: '🪨', papel: '📄', tijera: '✂️' })[m2]}\n\n🏆 ¡Gana **${p1.toString()}**!`;
            embed.color = 0xf1c40f;
        } else {
            embed.description = `**${p1.toString()}:** ${({ piedra: '🪨', papel: '📄', tijera: '✂️' })[m1]}\n**${p2.toString()}:** ${({ piedra: '🪨', papel: '📄', tijera: '✂️' })[m2]}\n\n🏆 ¡Gana **${p2.toString()}**!`;
            embed.color = 0xf1c40f;
        }

        return msg.edit({ embeds: [embed] }).catch(() => {});
    });
};
