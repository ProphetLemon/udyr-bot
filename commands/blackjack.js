const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const DECKS = 6;
const TIMEOUT_MS = 60000;

const REACTIONS = {
    hit: '🃏',
    stand: '✋',
    double: '⏫',
};

function createShoe() {
    const shoe = [];
    for (let d = 0; d < DECKS; d++) {
        for (const suit of SUITS) {
            for (const val of VALUES) {
                shoe.push({ val, suit });
            }
        }
    }
    for (let i = shoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }
    return shoe;
}

let shoe = createShoe();

function drawCard() {
    if (shoe.length < 15) shoe = createShoe();
    return shoe.pop();
}

function cardDisplay(card) {
    return `${card.val}${card.suit}`;
}

function handDisplay(cards, hideLast) {
    return cards.map((c, i) => {
        if (hideLast && i === cards.length - 1) return '❓';
        return cardDisplay(c);
    }).join(' ');
}

function handValue(cards) {
    let total = 0;
    let aces = 0;
    for (const c of cards) {
        if (c.val === 'A') { aces++; total += 11; }
        else if (['K', 'Q', 'J'].includes(c.val)) total += 10;
        else total += parseInt(c.val, 10);
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return { total, soft: aces > 0 };
}

function isBlackjack(cards) {
    return cards.length === 2 && handValue(cards).total === 21;
}

function buildGameEmbed(playerCards, dealerCards, hideDealer, extraText) {
    const pVal = handValue(playerCards);
    const pDisplay = handDisplay(playerCards, false);
    const dDisplay = handDisplay(dealerCards, hideDealer);
    const pTotal = ` (${pVal.total}${pVal.soft ? ' soft' : ''})`;

    let desc = '';
    desc += `**Tus cartas:** ${pDisplay}${pTotal}\n`;
    desc += `**Dealer:** ${dDisplay}`;
    if (!hideDealer) {
        const dVal = handValue(dealerCards);
        desc += ` (${dVal.total})`;
    }
    if (extraText) desc += `\n\n${extraText}`;

    return {
        color: 0x1b5e20,
        title: '🎴 BLACKJACK',
        description: desc,
    };
}

async function dealerTurn(msg, playerCards, dealerCards) {
    let dVal = handValue(dealerCards);
    while (dVal.total < 17 || (dVal.total === 17 && dVal.soft)) {
        dealerCards.push(drawCard());
        dVal = handValue(dealerCards);
        await msg.edit({ embeds: [buildGameEmbed(playerCards, dealerCards, false, '⏳ Dealer pide carta...')] });
        await new Promise((r) => setTimeout(r, 1200));
    }

    const pVal = handValue(playerCards);
    dVal = handValue(dealerCards);

    let result;
    let color = 0x1b5e20;
    if (dVal.total > 21) {
        result = '💥 Dealer se pasó de 21. **¡GANAS!**';
        color = 0xf1c40f;
    } else if (pVal.total > dVal.total) {
        result = '🎉 Tus cartas superan al dealer. **¡GANAS!**';
        color = 0xf1c40f;
    } else if (dVal.total > pVal.total) {
        result = '😔 El dealer te supera. **PIERDES.**';
        color = 0xe74c3c;
    } else {
        result = '🤝 **EMPATE** — Misma puntuación.';
        color = 0x95a5a6;
    }

    const embed = buildGameEmbed(playerCards, dealerCards, false, result);
    embed.color = color;
    return msg.edit({ embeds: [embed] });
}

module.exports = async function handleBlackjack(message) {
    const playerCards = [drawCard(), drawCard()];
    const dealerCards = [drawCard(), drawCard()];

    const playerBJ = isBlackjack(playerCards);
    const dealerBJ = isBlackjack(dealerCards);

    if (playerBJ && dealerBJ) {
        const embed = buildGameEmbed(playerCards, dealerCards, false, '🤝 **EMPATE** — Ambos tienen Blackjack.');
        return message.reply({ embeds: [embed] });
    }
    if (playerBJ) {
        const embed = buildGameEmbed(playerCards, dealerCards, false, '🎉 **¡BLACKJACK!** Ganas con 21 natural.');
        return message.reply({ embeds: [embed] });
    }

    const prompt = '🃏 **Pedir**  |  ✋ **Plantarse**  |  ⏫ **Doblar**';
    const msg = await message.reply({ embeds: [buildGameEmbed(playerCards, dealerCards, true, prompt)] });
    await msg.react(REACTIONS.hit).catch(() => {});
    await msg.react(REACTIONS.stand).catch(() => {});
    await msg.react(REACTIONS.double).catch(() => {});

    const filter = (reaction, user) => {
        return user.id === message.author.id &&
            [REACTIONS.hit, REACTIONS.stand, REACTIONS.double].includes(reaction.emoji.name);
    };
    const collector = msg.createReactionCollector({ filter, time: TIMEOUT_MS });

    let canDouble = true;

    collector.on('collect', async (reaction) => {
        reaction.users.remove(message.author.id).catch(() => {});

        if (reaction.emoji.name === REACTIONS.stand) {
            collector.stop('user');
            return;
        }

        if (reaction.emoji.name === REACTIONS.double) {
            if (!canDouble) return;
            playerCards.push(drawCard());
            canDouble = false;
            collector.stop('user');
            return;
        }

        // hit
        if (reaction.emoji.name === REACTIONS.hit) {
            canDouble = false;
            playerCards.push(drawCard());
            const pVal = handValue(playerCards);
            if (pVal.total > 21) {
                collector.stop('user');
                return;
            }
            const newPrompt = '🃏 **Pedir**  |  ✋ **Plantarse**';
            await msg.edit({ embeds: [buildGameEmbed(playerCards, dealerCards, true, newPrompt)] });
        }
    });

    collector.on('end', async (_, reason) => {
        msg.reactions.removeAll().catch(() => {});

        const interacted = reason === 'user' || reason === 'limit';
        if (!interacted) {
            const embed = buildGameEmbed(playerCards, dealerCards, false, '⏰ Se acabó el tiempo. **PIERDES** por inactividad.');
            embed.color = 0x95a5a6;
            return msg.edit({ embeds: [embed] }).catch(() => {});
        }

        const pVal = handValue(playerCards);
        if (pVal.total > 21) {
            const embed = buildGameEmbed(playerCards, dealerCards, false, '💥 **BUST** — Te pasaste de 21. **PIERDES.**');
            embed.color = 0xe74c3c;
            return msg.edit({ embeds: [embed] }).catch(() => {});
        }

        await dealerTurn(msg, playerCards, dealerCards);
    });
};
