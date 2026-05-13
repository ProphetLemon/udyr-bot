const DICE = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };
const TIMEOUT_MS = 60000;

function roll() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

function diceDisplay(d1, d2) {
    return `${DICE[d1]} ${DICE[d2]}`;
}

function buildEmbed(state, extra) {
    const desc = `${diceDisplay(state.d1, state.d2)}  →  **${state.d1 + state.d2}**\n\n${extra || ''}`;
    return {
        color: state.point ? 0xe67e22 : 0x2ecc71,
        title: state.point ? `🎲 CRAPS — Punto: **${state.point}**` : '🎲 CRAPS — Tiro de salida',
        description: desc,
    };
}

module.exports = async function handleDados(message) {
    const d = roll();
    const sum = d[0] + d[1];
    const state = { d1: d[0], d2: d[1], point: null };

    let extra;
    if (sum === 7 || sum === 11) {
        const embed = buildEmbed(state, '🎉 **¡GANAS!** — 7 u 11 en el tiro de salida.');
        embed.color = 0xf1c40f;
        return message.reply({ embeds: [embed] });
    }
    if (sum === 2 || sum === 3 || sum === 12) {
        const embed = buildEmbed(state, '💀 **CRAPS** — 2, 3 o 12. **PIERDES.**');
        embed.color = 0xe74c3c;
        return message.reply({ embeds: [embed] });
    }

    state.point = sum;
    extra = `🎯 **Punto establecido: ${sum}**\nTira de nuevo hasta sacar ${sum} (ganas) o 7 (pierdes).\n\nReacciona con 🎲 para tirar`;

    const msg = await message.reply({ embeds: [buildEmbed(state, extra)] });
    await msg.react('🎲').catch(() => {});

    const filter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === '🎲';
    const collector = msg.createReactionCollector({ filter, time: TIMEOUT_MS });

    collector.on('collect', async (reaction) => {
        reaction.users.remove(message.author.id).catch(() => {});

        const d2 = roll();
        state.d1 = d2[0];
        state.d2 = d2[1];
        const s = d2[0] + d2[1];

        let result;
        let color;

        if (s === state.point) {
            result = `🎉 **¡GANAS!** — Sacaste ${s}, justo tu punto.`;
            color = 0xf1c40f;
            collector.stop();
        } else if (s === 7) {
            result = `💀 **SIETE — PIERDES.**`;
            color = 0xe74c3c;
            collector.stop();
        } else {
            result = `Sigue tirando. Buscas el **${state.point}**, evita el 7.\n\nReacciona con 🎲 para tirar`;
        }

        const embed = buildEmbed(state, result);
        if (color) embed.color = color;
        await msg.edit({ embeds: [embed] }).catch(() => {});
    });

    collector.on('end', async (_, reason) => {
        msg.reactions.removeAll().catch(() => {});
        if (reason !== 'user') {
            const embed = buildEmbed(state, '⏰ Se acabó el tiempo. **PIERDES** por inactividad.');
            embed.color = 0x95a5a6;
            return msg.edit({ embeds: [embed] }).catch(() => {});
        }
    });
};
