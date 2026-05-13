const HORSES = ['🐎', '🐴', '🏇', '🦄', '🐴'];
const TRACK_LENGTH = 18;
const BET_TIME_MS = 20000;
const TICK_MS = 1500;

function buildTrack(horses, positions, phase) {
    const lines = [];
    for (let i = 0; i < horses.length; i++) {
        const track = '─'.repeat(TRACK_LENGTH);
        const pos = Math.min(positions[i], TRACK_LENGTH - 1);
        const before = track.slice(0, pos);
        const after = track.slice(pos + 1);
        lines.push(`${horses[i]} ${before}🐎${after} 🏁`);
    }

    let desc = '**Caballos:**\n' + lines.join('\n');
    if (phase === 'betting') {
        desc += '\n\n⏳ **Apuestas abiertas** — Reacciona al número del caballo (1-5) en el que quieres apostar.\nSe cierra en 20 segundos.';
    } else if (phase === 'racing') {
        desc += '\n\n🏇 ¡En sus marcas... listos... **YA!**';
    } else {
        desc += '\n\n🏁 **¡Carrera terminada!**';
    }

    return {
        color: 0xe67e22,
        title: '🏇 CARRERA DE CABALLOS',
        description: desc,
        footer: phase === 'betting' ? { text: 'Reacciona 1️⃣-5️⃣ para apostar' } : undefined,
    };
}

module.exports = async function handleCarrera(message) {
    const positions = HORSES.map(() => 0);
    const bets = {}; // userId → horseIndex
    const horseEmojis = { '1️⃣': 0, '2️⃣': 1, '3️⃣': 2, '4️⃣': 3, '5️⃣': 4 };

    const embed = buildTrack(HORSES, positions, 'betting');
    const msg = await message.reply({ embeds: [embed] });
    for (const emoji of Object.keys(horseEmojis)) {
        await msg.react(emoji).catch(() => {});
    }

    // Betting phase
    const betFilter = (reaction, user) => {
        return !user.bot && Object.keys(horseEmojis).includes(reaction.emoji.name);
    };
    const betCollector = msg.createReactionCollector({ filter: betFilter, time: BET_TIME_MS });

    betCollector.on('collect', (reaction, user) => {
        bets[user.id] = horseEmojis[reaction.emoji.name];
        reaction.users.remove(user.id).catch(() => {});
    });

    await new Promise((resolve) => betCollector.on('end', resolve));
    msg.reactions.removeAll().catch(() => {});

    // Racing phase
    let winner = null;
    while (winner === null) {
        for (let i = 0; i < HORSES.length; i++) {
            const step = Math.floor(Math.random() * 4);
            positions[i] += step;
            if (positions[i] >= TRACK_LENGTH - 1) {
                positions[i] = TRACK_LENGTH - 1;
                winner = i;
                break;
            }
        }

        const raceEmbed = buildTrack(HORSES, positions, winner !== null ? 'finished' : 'racing');
        await msg.edit({ embeds: [raceEmbed] }).catch(() => {});

        if (winner !== null) break;
        await new Promise((r) => setTimeout(r, TICK_MS));
    }

    // Results
    const winners = Object.entries(bets).filter(([, horse]) => horse === winner);
    let resultExtra = `\n\n🏆 **¡Gana el caballo ${winner + 1}!** ${HORSES[winner]}\n\n`;

    if (winners.length === 0) {
        resultExtra += 'Nadie apostó al ganador.';
    } else {
        resultExtra += '**Ganadores:**\n';
        for (const [userId] of winners) {
            resultExtra += `<@${userId}> ¡acertaste!\n`;
        }
    }

    const resultEmbed = buildTrack(HORSES, positions, 'finished');
    resultEmbed.description += resultExtra;
    resultEmbed.color = 0xf1c40f;
    return msg.edit({ embeds: [resultEmbed] }).catch(() => {});
};
