const ROWS = 6;
const COLS = 7;
const EMPTY = '⚪';
const P1_PIECE = '🔴';
const P2_PIECE = '🔵';
const COL_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];
const TIMEOUT_MS = 120000;

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function dropPiece(board, col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = player;
            return r;
        }
    }
    return -1;
}

function checkWin(board, row, col, player) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1],
    ];
    for (const [dr, dc] of directions) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++;
            else break;
        }
        for (let i = 1; i < 4; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++;
            else break;
        }
        if (count >= 4) return true;
    }
    return false;
}

function isFull(board) {
    return board[0].every((cell) => cell !== 0);
}

function renderBoard(board, currentPlayer) {
    const header = COL_EMOJIS.join('');
    const rows = board.map((row) =>
        row.map((cell) => cell === 1 ? P1_PIECE : cell === 2 ? P2_PIECE : EMPTY).join('')
    );
    const turn = currentPlayer === 1 ? P1_PIECE : P2_PIECE;
    return header + '\n' + rows.join('\n') + `\n\nTurno: ${turn}`;
}

module.exports = async function handleConecta4(message, args) {
    const mentioned = message.mentions.users.first();
    if (!mentioned) {
        return message.reply('Menciona a alguien. Ejemplo: `udyr conecta4 @usuario`');
    }
    if (mentioned.id === message.author.id) {
        return message.reply('No puedes jugar contra ti mismo.');
    }
    if (mentioned.bot) {
        return message.reply('No puedes retar a un bot.');
    }

    const p1 = message.author;
    const p2 = mentioned;
    const board = createBoard();
    let current = 1; // 1 = p1, 2 = p2

    const embed = {
        color: 0x3498db,
        title: '🔴🔵 CONECTA 4',
        description: `**${p1.toString()}** 🔴 VS **${p2.toString()}** 🔵\n\n${renderBoard(board, current)}`,
    };

    const msg = await message.reply({ embeds: [embed] });
    for (const emoji of COL_EMOJIS) {
        await msg.react(emoji).catch(() => {});
    }

    return new Promise((resolveGame) => {
        const filter = (reaction, user) => {
            const currentUser = current === 1 ? p1 : p2;
            return user.id === currentUser.id && COL_EMOJIS.includes(reaction.emoji.name);
        };
        const collector = msg.createReactionCollector({ filter, time: TIMEOUT_MS });

        collector.on('collect', async (reaction, user) => {
            const col = COL_EMOJIS.indexOf(reaction.emoji.name);
            const player = current;

            const row = dropPiece(board, col, player);
            if (row === -1) return;

            reaction.users.remove(user.id).catch(() => {});

            if (checkWin(board, row, col, player)) {
                collector.stop();
                const winner = player === 1 ? p1 : p2;
                const piece = player === 1 ? P1_PIECE : P2_PIECE;
                const winEmbed = {
                    color: 0xf1c40f,
                    title: '🔴🔵 CONECTA 4 — FIN',
                    description: `${renderBoard(board, 0)}\n\n🏆 **¡Gana ${winner.toString()}!** ${piece} conecta 4.`,
                };
                await msg.edit({ embeds: [winEmbed] }).catch(() => {});
                msg.reactions.removeAll().catch(() => {});
                resolveGame();
                return;
            }

            if (isFull(board)) {
                collector.stop();
                const drawEmbed = {
                    color: 0x95a5a6,
                    title: '🔴🔵 CONECTA 4 — FIN',
                    description: `${renderBoard(board, 0)}\n\n🤝 **EMPATE** — Tablero lleno.`,
                };
                await msg.edit({ embeds: [drawEmbed] }).catch(() => {});
                msg.reactions.removeAll().catch(() => {});
                resolveGame();
                return;
            }

            current = current === 1 ? 2 : 1;
            const nextUser = current === 1 ? p1 : p2;
            embed.description = `**${p1.toString()}** 🔴 VS **${p2.toString()}** 🔵\n\n${renderBoard(board, current)}`;
            await msg.edit({ embeds: [embed] }).catch(() => {});
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                const loser = current === 1 ? p1 : p2;
                const winner = current === 1 ? p2 : p1;
                const timeoutEmbed = {
                    color: 0x95a5a6,
                    title: '🔴🔵 CONECTA 4 — FIN',
                    description: `⏰ Se acabó el tiempo.\n\n🏆 Gana **${winner.toString()}** por abandono de ${loser.toString()}.`,
                };
                await msg.edit({ embeds: [timeoutEmbed] }).catch(() => {});
                msg.reactions.removeAll().catch(() => {});
                resolveGame();
            }
        });
    });
};
