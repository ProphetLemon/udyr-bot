const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const DECKS = 6;
const TIMEOUT_MS = 60000;

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
    const pTotal = !hideDealer || playerCards.length > 0 ? ` (${pVal.total}${pVal.soft ? ' soft' : ''})` : '';

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

module.exports = async function handleBlackjack(message) {
    const playerCards = [drawCard(), drawCard()];
    const dealerCards = [drawCard(), drawCard()];

    const playerBJ = isBlackjack(playerCards);
    const dealerBJ = isBlackjack(dealerCards);

    if (playerBJ && dealerBJ) {
        const embed = buildGameEmbed(playerCards, dealerCards, false, '🤝 **EMPATE** — Ambos tienen Blackjack. Recuperas tu apuesta.');
        return message.reply({ embeds: [embed] });
    }
    if (playerBJ) {
        const embed = buildGameEmbed(playerCards, dealerCards, false, '🎉 **¡BLACKJACK!** Ganas con 21 natural.');
        return message.reply({ embeds: [embed] });
    }

    const msg = await message.reply({ embeds: [buildGameEmbed(playerCards, dealerCards, true, 'Escribe **pedir** o **plantarse**')] });

    // --- Player turn ---
    let playerDone = false;
    while (!playerDone) {
        const filter = (m) => m.author.id === message.author.id;
        let collected;
        try {
            collected = await message.channel.awaitMessages({ filter, max: 1, time: TIMEOUT_MS });
        } catch {
            const embed = buildGameEmbed(playerCards, dealerCards, true, '⏰ Se acabó el tiempo. **PIERDES** por inactividad.');
            return msg.edit({ embeds: [embed] });
        }
        if (collected.size === 0) {
            const embed = buildGameEmbed(playerCards, dealerCards, true, '⏰ Se acabó el tiempo. **PIERDES** por inactividad.');
            return msg.edit({ embeds: [embed] });
        }

        const choice = collected.first().content.trim().toLowerCase();
        collected.first().delete().catch(() => {});

        if (choice === 'plantarse' || choice === 'stand' || choice === 's') {
            playerDone = true;
        } else if (choice === 'pedir' || choice === 'hit' || choice === 'h') {
            playerCards.push(drawCard());
            const pVal = handValue(playerCards);
            if (pVal.total > 21) {
                await msg.edit({ embeds: [buildGameEmbed(playerCards, dealerCards, false, '💥 **BUST** — Te pasaste de 21. **PIERDES.**')] });
                return;
            }
            await msg.edit({ embeds: [buildGameEmbed(playerCards, dealerCards, true, 'Escribe **pedir** o **plantarse**')] });
        } else {
            const embed = buildGameEmbed(playerCards, dealerCards, true, 'Opción no válida. Escribe **pedir** o **plantarse**');
            await msg.edit({ embeds: [embed] });
        }
    }

    // --- Dealer turn ---
    let dVal = handValue(dealerCards);
    while (dVal.total < 17 || (dVal.total === 17 && dVal.soft)) {
        dealerCards.push(drawCard());
        dVal = handValue(dealerCards);
        await msg.edit({ embeds: [buildGameEmbed(playerCards, dealerCards, false, '⏳ Dealer pide carta...')] });
        await new Promise((r) => setTimeout(r, 1200));
    }

    // --- Result ---
    const pVal = handValue(playerCards);
    dVal = handValue(dealerCards);

    let result;
    if (dVal.total > 21) {
        result = '💥 Dealer se pasó de 21. **¡GANAS!**';
    } else if (pVal.total > dVal.total) {
        result = '🎉 Tus cartas superan al dealer. **¡GANAS!**';
    } else if (dVal.total > pVal.total) {
        result = '😔 El dealer te supera. **PIERDES.**';
    } else {
        result = '🤝 **EMPATE** — Misma puntuación.';
    }

    return msg.edit({ embeds: [buildGameEmbed(playerCards, dealerCards, false, result)] });
};
