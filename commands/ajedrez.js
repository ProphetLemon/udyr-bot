const { Chess } = require('chess.js');

const PIECES = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
};

const MOVE_TIMEOUT_MS = 300000; // 5 min

function renderBoard(game) {
    const board = game.board();
    const rows = [];
    rows.push('```');
    rows.push('  a b c d e f g h');
    for (let r = 0; r < 8; r++) {
        const rank = 8 - r;
        let line = `${rank} `;
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            const key = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type) : null;
            line += (piece ? PIECES[key] : (r + c) % 2 === 0 ? '·' : ' ') + ' ';
        }
        line += `${rank}`;
        rows.push(line);
    }
    rows.push('  a b c d e f g h');
    rows.push('```');
    return rows.join('\n');
}

module.exports = async function handleAjedrez(message) {
    const mentioned = message.mentions.users.first();
    if (!mentioned) {
        return message.reply('Menciona a alguien. Ejemplo: `udyr ajedrez @usuario`');
    }
    if (mentioned.id === message.author.id) {
        return message.reply('No puedes jugar contra ti mismo.');
    }
    if (mentioned.bot) {
        return message.reply('No puedes retar a un bot.');
    }

    const white = message.author;
    const black = mentioned;
    const game = new Chess();

    let statusExtra = '';

    const buildEmbed = (extra) => ({
        color: 0x2c3e50,
        title: '♟️ AJEDREZ',
        description: `**⚪ ${white.toString()}** VS **⚫ ${black.toString()}**\n\n` +
            renderBoard(game) +
            `\nTurno: ${game.turn() === 'w' ? '⚪ Blancas' : '⚫ Negras'} — ` +
            `<@${game.turn() === 'w' ? white.id : black.id}>\n` +
            (game.isCheck() ? '⚠️ **¡Jaque!**\n' : '') +
            `${extra || ''}\n` +
            'Escribe tu jugada (ej: `e4`, `Nf3`) o `r` para rendirte.',
    });

    const msg = await message.reply({ embeds: [buildEmbed(statusExtra)] });

    while (!game.isGameOver()) {
        const currentPlayer = game.turn() === 'w' ? white : black;
        const filter = (m) => m.author.id === currentPlayer.id;

        let collected;
        try {
            collected = await message.channel.awaitMessages({ filter, max: 1, time: MOVE_TIMEOUT_MS });
        } catch {
            collected = undefined;
        }

        if (!collected || collected.size === 0) {
            const timeoutEmbed = {
                color: 0x95a5a6,
                title: '♟️ AJEDREZ — FIN',
                description: `⏰ Se acabó el tiempo de ${currentPlayer.toString()}.\n🏆 Gana **${currentPlayer.id === white.id ? black.toString() : white.toString()}** por tiempo.`,
            };
            await msg.edit({ embeds: [timeoutEmbed] }).catch(() => {});
            return;
        }

        const input = collected.first().content.trim();
        collected.first().delete().catch(() => {});

        if (input.toLowerCase() === 'r' || input.toLowerCase() === 'rendirse') {
            const resignEmbed = {
                color: 0xe74c3c,
                title: '♟️ AJEDREZ — FIN',
                description: `🏳️ **${currentPlayer.toString()}** se rinde.\n🏆 Gana **${currentPlayer.id === white.id ? black.toString() : white.toString()}**.`,
            };
            await msg.edit({ embeds: [resignEmbed] }).catch(() => {});
            return;
        }

        let move;
        try {
            move = game.move(input);
        } catch {
            move = null;
        }

        if (!move) {
            statusExtra = `❌ Jugada inválida: \`${input}\`. Intenta de nuevo.`;
            await msg.edit({ embeds: [buildEmbed(statusExtra)] }).catch(() => {});
            continue;
        }

        statusExtra = `Última jugada: **${move.san}**`;

        if (game.isCheck()) statusExtra += ' — ⚠️ **Jaque**';

        await msg.edit({ embeds: [buildEmbed(statusExtra)] }).catch(() => {});
    }

    // Game over
    let resultText;
    let resultColor = 0xf1c40f;

    if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? black : white;
        resultText = `♚ **¡JAQUE MATE!**\n🏆 Gana **${winner.toString()}**.`;
    } else if (game.isStalemate()) {
        resultText = '🤝 **TABLAS** — Rey ahogado.';
        resultColor = 0x95a5a6;
    } else if (game.isThreefoldRepetition()) {
        resultText = '🤝 **TABLAS** — Repetición triple.';
        resultColor = 0x95a5a6;
    } else if (game.isInsufficientMaterial()) {
        resultText = '🤝 **TABLAS** — Material insuficiente.';
        resultColor = 0x95a5a6;
    } else {
        resultText = '🤝 **TABLAS**.';
        resultColor = 0x95a5a6;
    }

    const finalEmbed = {
        color: resultColor,
        title: '♟️ AJEDREZ — FIN',
        description: `**⚪ ${white.toString()}** VS **⚫ ${black.toString()}**\n\n` +
            renderBoard(game) +
            `\n${resultText}`,
    };
    return msg.edit({ embeds: [finalEmbed] }).catch(() => {});
};
