const SYMBOLS = ['🍓', '🍎', '🍋', '🍇', '🍒', '🍊', '🍉', '🍌'];
const COLS = 5;
const ROWS = 3;
const SPIN_FRAMES = 5;
const SPIN_DELAY_MS = 400;

function pick() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function gridPick() {
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = pick();
        }
    }
    return grid;
}

function render(grid) {
    const lines = ['🎰 ╔═══╤═══╤═══╤═══╤═══╗ 🎰'];
    for (let r = 0; r < ROWS; r++) {
        const row = grid[r].map((c) => ` ${c} `).join('│');
        lines.push(`   ║${row}║`);
        if (r < ROWS - 1) lines.push('   ╟───┼───┼───┼───┼───╢');
    }
    lines.push('   ╚═══╧═══╧═══╧═══╧═══╝');
    return lines.join('\n');
}

function longestRun(arr) {
    let bestLen = 0;
    let bestStart = 0;
    let curLen = 1;
    let curStart = 0;
    for (let i = 1; i <= arr.length; i++) {
        if (i < arr.length && arr[i] === arr[i - 1]) {
            curLen++;
        } else {
            if (curLen > bestLen) {
                bestLen = curLen;
                bestStart = curStart;
            }
            curLen = 1;
            curStart = i;
        }
    }
    return { len: bestLen, start: bestStart };
}

function detectPatterns(grid) {
    const found = [];
    const add = (name, multiplier, desc) => found.push({ name, multiplier, desc });

    const allCells = grid.flat();
    const allSame = allCells.every((c) => c === allCells[0]);
    if (allSame) {
        add('JACKPOT', 20, 'Toda la rejilla con el mismo símbolo');
        return found;
    }

    // --- EYE (×8): borde ovalado mismo símbolo, centro distinto ---
    const eyePositions = [
        [0, 1], [0, 2], [0, 3],
        [1, 0], [1, 4],
        [2, 1], [2, 2], [2, 3],
    ];
    const eyeVals = eyePositions.map(([r, c]) => grid[r][c]);
    const innerPositions = [[1, 1], [1, 2], [1, 3]];
    const innerVals = innerPositions.map(([r, c]) => grid[r][c]);
    const eyeUniform = eyeVals.every((v) => v === eyeVals[0]);
    const centerDiff = innerVals.some((v) => v !== eyeVals[0]);
    const isEye = eyeUniform && centerDiff;
    if (isEye) {
        add('EYE', 8, 'Forma de ojo (borde ovalado, centro distinto)');
        return found;
    }

    // --- ABOVE (×7): V invertida apuntando arriba ---
    const abovePositions = [
        [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
        [1, 1], [1, 3],
        [0, 2],
    ];
    const aboveVals = abovePositions.map(([r, c]) => grid[r][c]);
    if (aboveVals.every((v) => v === aboveVals[0])) {
        add('ABOVE', 7, 'Flecha hacia arriba (base abajo)');
    }

    // --- BELOW (×7): V apuntando abajo ---
    const belowPositions = [
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 1], [1, 3],
        [2, 2],
    ];
    const belowVals = belowPositions.map(([r, c]) => grid[r][c]);
    if (belowVals.every((v) => v === belowVals[0])) {
        add('BELOW', 7, 'Flecha hacia abajo (base arriba)');
    }

    // --- HOR / HOR-L / HOR-XL por fila (toma la racha más larga) ---
    for (let r = 0; r < ROWS; r++) {
        const { len } = longestRun(grid[r]);
        if (len >= 5) add('HOR-XL', 3, `Fila ${r + 1} completa (5 en línea)`);
        else if (len >= 4) add('HOR-L', 2, `Fila ${r + 1}: 4 en línea`);
        else if (len >= 3) add('HOR', 1, `Fila ${r + 1}: 3 en línea`);
    }

    // --- VERT (×1): columna completa ---
    for (let c = 0; c < COLS; c++) {
        if (grid[0][c] === grid[1][c] && grid[1][c] === grid[2][c]) {
            add('VERT', 1, `Columna ${c + 1} completa`);
        }
    }

    // --- DIAG (×1): diagonales de 3 celdas ---
    const diags = [
        [[0, 0], [1, 1], [2, 2]],
        [[0, 1], [1, 2], [2, 3]],
        [[0, 2], [1, 3], [2, 4]],
        [[2, 0], [1, 1], [0, 2]],
        [[2, 1], [1, 2], [0, 3]],
        [[2, 2], [1, 3], [0, 4]],
    ];
    for (const d of diags) {
        const vals = d.map(([r, c]) => grid[r][c]);
        if (vals[0] === vals[1] && vals[1] === vals[2]) {
            add('DIAG', 1, 'Diagonal de 3');
        }
    }

    // --- ZIG (×4): zigzag centro-arriba → laterales-medio → esquinas-abajo ---
    const zigPositions = [[0, 2], [1, 1], [1, 3], [2, 0], [2, 4]];
    const zigVals = zigPositions.map(([r, c]) => grid[r][c]);
    if (zigVals.every((v) => v === zigVals[0])) {
        add('ZIG', 4, 'Zigzag');
    }

    // --- ZAG (×4): zigzag inverso (esquinas-arriba → laterales-medio → centro-abajo) ---
    const zagPositions = [[0, 0], [0, 4], [1, 1], [1, 3], [2, 2]];
    const zagVals = zagPositions.map(([r, c]) => grid[r][c]);
    if (zagVals.every((v) => v === zagVals[0])) {
        add('ZAG', 4, 'Zigzag inverso');
    }

    return found;
}

module.exports = async function handleRuleta(message) {
    const emptyGrid = Array.from({ length: ROWS }, () => Array(COLS).fill('❓'));
    const sent = await message.channel.send(render(emptyGrid) + '\n\nGirando...');

    for (let frame = 0; frame < SPIN_FRAMES; frame++) {
        await sleep(SPIN_DELAY_MS);
        try {
            await sent.edit(render(gridPick()) + '\n\nGirando...');
        } catch (e) {
            console.debug('[RULETA] edit fallo:', e.message);
        }
    }

    const final = gridPick();
    await sleep(SPIN_DELAY_MS);
    try {
        await sent.edit(render(final) + '\n\nAnalizando...');
    } catch (e) {
        console.debug('[RULETA] edit fallo:', e.message);
    }

    const patterns = detectPatterns(final);
    const hasPatternMultiplier = Math.random() < 0.3;
    const globalMult = hasPatternMultiplier ? 2 : 1;

    let resultText = render(final) + '\n\n';

    if (patterns.length === 0) {
        resultText += `💀 **NADA** — ${message.author}, la casa siempre gana.`;
    } else {
        resultText += '**Patrones detectados:**\n';
        let totalMult = 0;
        for (const p of patterns) {
            resultText += `🔹 **${p.name}** ×${p.multiplier} — ${p.desc}\n`;
            totalMult += p.multiplier;
        }
        const finalMult = totalMult * globalMult;
        if (hasPatternMultiplier) {
            resultText += `\n✨ **PATTERN MULTIPLIER ×2** activo`;
        }
        resultText += `\n\n💰 **Premio total: ×${finalMult}** — ¡${message.author}!`;
    }

    await message.channel.send(resultText);
};
