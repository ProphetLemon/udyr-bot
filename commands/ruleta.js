const SYMBOLS = ['🍓', '🍎', '🍋', '🍇', '🍒', '🍊', '🍉', '🍌'];
const SPIN_FRAMES = 5;
const SPIN_DELAY_MS = 450;

function pick() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function render(reels) {
    return `🎰 | ${reels[0]} | ${reels[1]} | ${reels[2]} | 🎰`;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

module.exports = async function handleRuleta(message) {
    const sent = await message.channel.send(render(['❓', '❓', '❓']));
    const stopped = [null, null, null];

    for (let frame = 0; frame < SPIN_FRAMES; frame++) {
        const reels = stopped.map((s) => s ?? pick());
        await sleep(SPIN_DELAY_MS);
        try { await sent.edit(render(reels)); } catch {}
    }

    const final = [pick(), pick(), pick()];
    for (let i = 0; i < 3; i++) {
        stopped[i] = final[i];
        const reels = stopped.map((s, idx) => s ?? (idx <= i ? final[idx] : pick()));
        await sleep(SPIN_DELAY_MS);
        try { await sent.edit(render(reels)); } catch {}
    }

    let result;
    if (final[0] === final[1] && final[1] === final[2]) {
        result = `🎉 **JACKPOT** ${message.author} 🎉`;
    } else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) {
        result = `✨ Casi, ${message.author}. Premio pequeño.`;
    } else {
        result = `💀 Nada, ${message.author}. La casa siempre gana.`;
    }

    await message.channel.send(result);
};
