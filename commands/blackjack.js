const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const DECKS = 6;
const TIMEOUT_MS = 60000;

const REACTIONS = {
    hit: '🃏',
    stand: '✋',
    double: '⏫',
    split: '✂️',
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

function isPair(c1, c2) {
    if (c1.val === c2.val) return true;
    if (['J', 'Q', 'K'].includes(c1.val) && ['J', 'Q', 'K'].includes(c2.val)) return true;
    return false;
}

function handResultText(hand) {
    if (hand.bust) return '💥 BUST';
    if (hand.doubled) return '⏫ Doblaste';
    return `(${handValue(hand.cards).total})`;
}

function buildGameEmbed(hands, activeIdx, dealerCards, hideDealer, extraText) {
    let desc = '';
    const multi = hands.length > 1;

    if (multi) desc += '**Tus manos:**\n';
    for (let i = 0; i < hands.length; i++) {
        const h = hands[i];
        const prefix = multi
            ? (i === activeIdx ? '🟢' : '⚪') + ` **Mano ${i + 1}:** `
            : '**Tus cartas:** ';
        const display = handDisplay(h.cards, false);
        const val = handValue(h.cards);
        desc += prefix + display + ` (${val.total}${val.soft ? ' soft' : ''})`;
        if (h.done) desc += ` → ${handResultText(h)}`;
        desc += '\n';
    }

    const dDisplay = handDisplay(dealerCards, hideDealer);
    desc += `\n**Dealer:** ${dDisplay}`;
    if (!hideDealer) desc += ` (${handValue(dealerCards).total})`;
    if (extraText) desc += `\n\n${extraText}`;

    return {
        color: 0x1b5e20,
        title: '🎴 BLACKJACK',
        description: desc,
    };
}

async function playHand(msg, hands, handIdx, dealerCards, authorId) {
    const hand = hands[handIdx];
    const canDouble = hand.cards.length === 2;
    const allReactions = [REACTIONS.hit, REACTIONS.stand];
    if (canDouble) allReactions.push(REACTIONS.double);

    const promptParts = ['🃏 **Pedir**', '✋ **Plantarse**'];
    if (canDouble) promptParts.push('⏫ **Doblar**');

    const embed = buildGameEmbed(hands, handIdx, dealerCards, true, promptParts.join('  |  '));
    await msg.edit({ embeds: [embed] });

    msg.reactions.removeAll().catch(() => {});
    for (const r of allReactions) {
        await msg.react(r).catch(() => {});
    }

    return new Promise((resolve) => {
        const filter = (reaction, user) => {
            return user.id === authorId && allReactions.includes(reaction.emoji.name);
        };

        const collector = msg.createReactionCollector({ filter, time: TIMEOUT_MS, max: 1 });

        collector.on('collect', async (reaction) => {
            reaction.users.remove(authorId).catch(() => {});

            if (reaction.emoji.name === REACTIONS.stand) {
                collector.stop();
                hand.done = true;
                resolve('stand');
                return;
            }

            if (reaction.emoji.name === REACTIONS.double && canDouble) {
                hand.cards.push(drawCard());
                hand.doubled = true;
                hand.done = true;
                const pVal = handValue(hand.cards);
                if (pVal.total > 21) hand.bust = true;
                collector.stop();
                resolve('double');
                return;
            }

            if (reaction.emoji.name === REACTIONS.hit) {
                hand.cards.push(drawCard());
                const pVal = handValue(hand.cards);
                if (pVal.total > 21) {
                    hand.bust = true;
                    hand.done = true;
                    collector.stop();
                    resolve('bust');
                    return;
                }
                collector.stop();
                resolve('hit');
                return;
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                hand.done = true;
                resolve('timeout');
            }
        });
    });
}

async function dealerTurn(msg, hands, dealerCards) {
    let dVal = handValue(dealerCards);
    while (dVal.total < 17 || (dVal.total === 17 && dVal.soft)) {
        dealerCards.push(drawCard());
        dVal = handValue(dealerCards);
        const embed = buildGameEmbed(hands, -1, dealerCards, false, '⏳ Dealer pide carta...');
        await msg.edit({ embeds: [embed] });
        await new Promise((r) => setTimeout(r, 1200));
    }
}

async function showResults(msg, hands, dealerCards) {
    const dVal = handValue(dealerCards);
    const lines = [];

    for (let i = 0; i < hands.length; i++) {
        const h = hands[i];
        const hVal = handValue(h.cards);
        const label = hands.length > 1 ? `Mano ${i + 1}: ` : '';
        const cards = handDisplay(h.cards, false);

        if (h.bust) {
            lines.push(`${label}${cards} (${hVal.total}) → 💥 BUST — **PIERDES**`);
        } else if (h.timeout) {
            lines.push(`${label}${cards} (${hVal.total}) → ⏰ Timeout — **PIERDES**`);
        } else if (dVal.total > 21) {
            lines.push(`${label}${cards} (${hVal.total}) → 🎉 Dealer bust — **GANAS**`);
        } else if (hVal.total > dVal.total) {
            lines.push(`${label}${cards} (${hVal.total}) → 🎉 Superas al dealer — **GANAS**`);
        } else if (dVal.total > hVal.total) {
            lines.push(`${label}${cards} (${hVal.total}) → 😔 El dealer te supera — **PIERDES**`);
        } else {
            lines.push(`${label}${cards} (${hVal.total}) → 🤝 Empate`);
        }
    }

    const dDisplay = handDisplay(dealerCards, false);
    const fullText = `**Dealer:** ${dDisplay} (${dVal.total})\n\n` + lines.join('\n');

    const color = lines.some((l) => l.includes('GANAS')) && !lines.every((l) => l.includes('GANAS'))
        ? 0x95a5a6  // split: some win some lose = mixed
        : lines.every((l) => l.includes('GANAS')) ? 0xf1c40f
        : lines.every((l) => l.includes('Empate')) ? 0x95a5a6
        : 0xe74c3c;

    return msg.edit({ embeds: [{ color, title: '🎴 BLACKJACK — Resultado', description: fullText }] });
}

module.exports = async function handleBlackjack(message) {
    const c1 = drawCard();
    const c2 = drawCard();
    const dealerCards = [drawCard(), drawCard()];

    const hands = [];

    // Check for pair (split opportunity)
    const pair = isPair(c1, c2);

    // Show initial cards + split prompt if applicable
    hands.push({ cards: [c1, c2], done: false, bust: false, doubled: false, timeout: false });

    const playerBJ = isBlackjack([c1, c2]);
    const dealerBJ = isBlackjack(dealerCards);

    if (playerBJ || dealerBJ) {
        let result;
        if (playerBJ && dealerBJ) result = '🤝 **EMPATE** — Ambos tienen Blackjack.';
        else if (playerBJ) result = '🎉 **¡BLACKJACK!** Ganas con 21 natural.';
        const embed = buildGameEmbed(hands, 0, dealerCards, false, result);
        return message.reply({ embeds: [embed] });
    }

    // Ask split
    if (pair) {
        hands[0].done = true;
        const splitEmbed = buildGameEmbed(hands, 0, dealerCards, true,
            'Tienes una pareja. ¿Dividir?\n🃏 **Jugar normal**  |  ✂️ **Dividir**');
        const splitMsg = await message.reply({ embeds: [splitEmbed] });
        await splitMsg.react(REACTIONS.hit).catch(() => {});
        await splitMsg.react(REACTIONS.split).catch(() => {});

        const splitChoice = await new Promise((resolve) => {
            const filter = (r, u) => u.id === message.author.id &&
                [REACTIONS.hit, REACTIONS.split].includes(r.emoji.name);
            const c = splitMsg.createReactionCollector({ filter, max: 1, time: TIMEOUT_MS });
            c.on('collect', async (r) => {
                c.stop();
                resolve(r.emoji.name);
            });
            c.on('end', (_, reason) => {
                if (reason !== 'user') resolve('timeout');
            });
        });

        splitMsg.reactions.removeAll().catch(() => {});

        if (splitChoice === REACTIONS.split) {
            hands.length = 0;
            hands.push({ cards: [c1, drawCard()], done: false, bust: false, doubled: false, timeout: false });
            hands.push({ cards: [c2, drawCard()], done: false, bust: false, doubled: false, timeout: false });
        } else if (splitChoice === 'timeout') {
            const embed = buildGameEmbed(hands, 0, dealerCards, false, '⏰ Se acabó el tiempo. **PIERDES** por inactividad.');
            embed.color = 0x95a5a6;
            return splitMsg.edit({ embeds: [embed] }).catch(() => {});
        } else {
            hands[0].done = false;
        }

        if (splitChoice === REACTIONS.split || splitChoice === REACTIONS.hit) {
            await splitMsg.delete().catch(() => {});
        }
    }

    const msg = await message.reply({ embeds: [buildGameEmbed(hands, 0, dealerCards, true, 'Preparando...')] });

    // Play each hand
    for (let i = 0; i < hands.length; i++) {
        if (hands[i].done) continue;

        let playing = true;
        while (playing) {
            const result = await playHand(msg, hands, i, dealerCards, message.author.id);
            if (result === 'stand' || result === 'double') playing = false;
            if (result === 'bust' || result === 'timeout') {
                if (result === 'timeout') hands[i].timeout = true;
                playing = false;
            }
            if (hands[i].bust) playing = false;
        }
    }

    // Dealer turn (skip if all hands busted)
    const allBust = hands.every((h) => h.bust || h.timeout);
    if (!allBust) {
        await dealerTurn(msg, hands, dealerCards);
    }

    // Show results
    msg.reactions.removeAll().catch(() => {});
    return showResults(msg, hands, dealerCards);
};
