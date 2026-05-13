const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const TIMEOUT_MS = 45000;
const REACTIONS = { higher: '⬆️', lower: '⬇️', cashout: '💰' };

function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const val of VALUES) {
            deck.push({ val, suit });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

let deck = createDeck();

function drawCard() {
    if (deck.length < 10) deck = createDeck();
    return deck.pop();
}

function cardValue(card) {
    if (card.val === 'A') return 14;
    if (card.val === 'K') return 13;
    if (card.val === 'Q') return 12;
    if (card.val === 'J') return 11;
    return parseInt(card.val, 10);
}

function streakMultiplier(streak) {
    if (streak >= 10) return 5;
    if (streak >= 7) return 4;
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    return 1;
}

function buildEmbed(current, streak, extra) {
    const mult = streakMultiplier(streak);
    return {
        color: 0x8e44ad,
        title: '⬆️⬇️ MAYOR O MENOR',
        description: `**Carta actual:** ${current.val}${current.suit}\n\n` +
            `Racha: **${streak}** | Multiplicador: **×${mult}**\n\n` +
            `⬆️ **Mayor**  |  ⬇️ **Menor**  |  💰 **Plantarse**\n\n${extra || ''}`,
    };
}

module.exports = async function handleMayorMenor(message) {
    let current = drawCard();
    let streak = 0;

    const embed = buildEmbed(current, streak, '¿La siguiente carta será mayor o menor?');
    const msg = await message.reply({ embeds: [embed] });
    await msg.react(REACTIONS.higher).catch(() => {});
    await msg.react(REACTIONS.lower).catch(() => {});
    await msg.react(REACTIONS.cashout).catch(() => {});

    const filter = (reaction, user) => {
        return user.id === message.author.id &&
            [REACTIONS.higher, REACTIONS.lower, REACTIONS.cashout].includes(reaction.emoji.name);
    };
    const collector = msg.createReactionCollector({ filter, time: TIMEOUT_MS });

    collector.on('collect', async (reaction) => {
        reaction.users.remove(message.author.id).catch(() => {});

        if (reaction.emoji.name === REACTIONS.cashout) {
            collector.stop();
            return;
        }

        const next = drawCard();
        const curVal = cardValue(current);
        const nextVal = cardValue(next);
        const guessedHigher = reaction.emoji.name === REACTIONS.higher;

        let correct = false;
        if (guessedHigher && nextVal > curVal) correct = true;
        if (!guessedHigher && nextVal < curVal) correct = true;

        if (correct) {
            streak++;
            current = next;
            const embed2 = buildEmbed(current, streak, `✅ **¡Correcto!** Era ${next.val}${next.suit}.`);
            await msg.edit({ embeds: [embed2] }).catch(() => {});
        } else {
            const mult = streakMultiplier(streak);
            const total = streak * mult;
            const embed3 = {
                color: 0xe74c3c,
                title: '⬆️⬇️ MAYOR O MENOR — FIN',
                description: `${current.val}${current.suit} → ${next.val}${next.suit}\n\n` +
                    `❌ **Fallaste.** La carta era ${next.val}${next.suit}.\n` +
                    (streak > 0 ? `Perdiste una racha de **${streak}** (×${mult}).` : 'No tenías racha acumulada.'),
            };
            await msg.edit({ embeds: [embed3] }).catch(() => {});
            collector.stop();
        }
    });

    collector.on('end', async (_, reason) => {
        msg.reactions.removeAll().catch(() => {});

        if (reason === 'user') {
            const mult = streakMultiplier(streak);
            const total = streak * mult;
            const embed4 = {
                color: 0xf1c40f,
                title: '⬆️⬇️ MAYOR O MENOR — RESULTADO',
                description: `💰 **Te plantaste** con racha de **${streak}**.\n` +
                    `Total: ${streak} × ${mult} = **×${total}**`,
            };
            return msg.edit({ embeds: [embed4] }).catch(() => {});
        }

        if (reason === 'time') {
            const embed5 = buildEmbed(current, streak, '⏰ Se acabó el tiempo.');
            embed5.color = 0x95a5a6;
            return msg.edit({ embeds: [embed5] }).catch(() => {});
        }
    });
};
