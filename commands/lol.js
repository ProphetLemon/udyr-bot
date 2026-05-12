const {
    lolChampions,
    normalizeChampName,
    getRandomChampionForLane,
} = require('../lib/lolData');
const { newUggPage } = require('../lib/uggBrowser');

const LANE_MAP = {
    mid: 'mid', medio: 'mid', m: 'mid',
    top: 'top', superior: 'top', sup: 'top',
    jungle: 'jungle', jg: 'jungle', jungla: 'jungle',
    adc: 'adc', bot: 'adc', tirador: 'adc',
    support: 'support', supp: 'support', soporte: 'support',
};

function parseArgs(args) {
    let buildChoice = null;
    if (args.length > 0 && /^\d+$/.test(args[args.length - 1])) {
        buildChoice = parseInt(args.pop(), 10);
    }
    const last = args[args.length - 1]?.toLowerCase();
    const lane = LANE_MAP[last] || 'mid';
    const champArgs = LANE_MAP[last] ? args.slice(0, -1) : args;
    return { buildChoice, lane, champInput: champArgs.join(' ') };
}

function resolveChampId(champInput) {
    const norm = normalizeChampName(champInput);
    let id = lolChampions.get(norm);
    if (id) return id;
    for (const [key, val] of lolChampions) {
        if (key.includes(norm) || norm.includes(key)) return val;
    }
    return null;
}

async function selectBuildTab(page, champId, buildChoice) {
    if (!buildChoice || buildChoice <= 1) return;
    try {
        const champLower = champId.toLowerCase();
        const tabs = await page
            .locator(`a[href*="/${champLower}/build"]`)
            .filter({ has: page.locator('div[class*="whitespace-nowrap"]') })
            .all();
        if (tabs.length >= buildChoice) {
            await tabs[buildChoice - 1].click();
            await page.waitForTimeout(3000);
        }
    } catch (e) {
        console.log('[LOL] Build alternativa fallo:', e.message);
    }
}

async function screenshotElement(page, selector, path, label) {
    try {
        const el = await page.locator(selector).first();
        if (await el.isVisible().catch(() => false)) {
            await el.scrollIntoViewIfNeeded();
            const box = await el.boundingBox();
            if (box) {
                await page.screenshot({
                    path,
                    clip: {
                        x: Math.max(0, Math.floor(box.x)),
                        y: Math.max(0, Math.floor(box.y)),
                        width: Math.ceil(box.width),
                        height: Math.ceil(box.height),
                    },
                });
                return;
            }
        }
    } catch (e) {
        console.log(`[LOL] Captura ${label} fallo:`, e.message);
    }
    await page.screenshot({ path, fullPage: false });
}

async function handleLolBuild(message, args) {
    const { buildChoice, lane, champInput } = parseArgs(args);
    if (!champInput) {
        return message.reply(
            'Debes escribir un campeon. Ejemplo: `udyr lol akali mid` o `udyr lol soraka supp 2`',
        );
    }

    const champId = resolveChampId(champInput);
    if (!champId) {
        return message.reply(
            `No encontre el campeon **${champInput}**. Asegurate de escribirlo bien.`,
        );
    }

    const url = `https://u.gg/lol/champions/${champId}/build?role=${lane}`;
    console.log(`[LOL] ${champId} ${lane} build=${buildChoice ?? 1}`);
    const loadingMsg = await message.reply(
        `Buscando build de **${champId}** ${lane}...`,
    );

    let release = () => {};
    try {
        const session = await newUggPage();
        release = session.release;
        const { page } = session;

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1000);

        await selectBuildTab(page, champId, buildChoice);

        const runePath = `/tmp/udyr-lol-${champId}-${lane}-runas.png`;
        const skillsPath = `/tmp/udyr-lol-${champId}-${lane}-skills.png`;
        const buildPath = `/tmp/udyr-lol-${champId}-${lane}-build.png`;

        await screenshotElement(page, '.rune-spell', runePath, 'runas');
        await screenshotElement(page, '.recommended-build_skills', skillsPath, 'skills');
        await page.waitForTimeout(500);
        await screenshotElement(
            page,
            '.recommended-build_items, [class*="recommended-build_items"]',
            buildPath,
            'items',
        );

        await loadingMsg.delete().catch(() => {});
        await message.channel.send(
            `Build de **${champId}** en **${lane.toUpperCase()}**\n${url}`,
        );
        await message.channel.send({ files: [runePath] });
        await message.channel.send({ files: [skillsPath] });
        await message.channel.send({ files: [buildPath] });
    } catch (err) {
        console.error('[LOL] Error:', err.message);
        await loadingMsg.edit(`No pude obtener la build. Puedes verla aqui: ${url}`)
            .catch(() => {});
    } finally {
        await release();
    }
}

async function handleLolTeam(message) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
        return message.reply(
            'Tienes que estar en un canal de voz para usar este comando.',
        );
    }

    const members = Array.from(voiceChannel.members.values())
        .filter((m) => !m.user.bot && m.id !== message.client.user.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    if (members.length === 0) {
        return message.reply('No hay nadie mas en tu canal de voz.');
    }

    const lanes = ['top', 'jungle', 'mid', 'adc', 'support'];
    const count = members.length;
    const shuffledLanes = lanes.sort(() => Math.random() - 0.5).slice(0, count);

    const laneEmojis = {
        top: '\u{1F6E1}',
        jungle: '\u{1F332}',
        mid: '\u{26A1}',
        adc: '\u{1F3F9}',
        support: '\u{2764}',
    };

    let text = '**Equipo asignado:**\n';
    for (let i = 0; i < count; i++) {
        const lane = shuffledLanes[i];
        const champ = getRandomChampionForLane(lane) || '???';
        text += `\n${laneEmojis[lane]} **${members[i].toString()}** → ${lane.toUpperCase()}: **${champ}**`;
    }

    return message.channel.send(text);
}

module.exports = async function handleLol(message, args) {
    if (args.length < 1) {
        return message.reply(
            'Debes escribir un campeon. Ejemplo: `udyr lol akali mid` o `udyr lol soraka supp 2`',
        );
    }
    if (args[0]?.toLowerCase() === 'equipo') {
        return handleLolTeam(message);
    }
    return handleLolBuild(message, args);
};
