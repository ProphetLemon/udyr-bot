const { chromium } = require('playwright');
const { lolChampions, normalizeChampName, getRandomChampionForLane } = require('../lib/lolData');

module.exports = async function handleLol(message, args) {
    if (args.length < 1) {
        return message.reply('Debes escribir un campeon. Ejemplo: `udyr lol akali mid` o `udyr lol soraka supp 2`');
    }

    if (args[0]?.toLowerCase() === 'equipo') {
        return handleLolTeam(message);
    }

    // Mapeo de lineas
    const laneMap = {
        mid: 'mid', medio: 'mid', m: 'mid',
        top: 'top', superior: 'top', sup: 'top',
        jungle: 'jungle', jg: 'jungle', jungla: 'jungle',
        adc: 'adc', bot: 'adc', tirador: 'adc',
        support: 'support', supp: 'support', soporte: 'support',
    };

    // Detectar build alternativa (numero al final)
    let buildChoice = null;
    if (args.length > 0 && !isNaN(parseInt(args[args.length - 1]))) {
        buildChoice = parseInt(args.pop());
    }

    const lane = laneMap[args[args.length - 1]?.toLowerCase()] || 'mid';
    // Si el ultimo arg es una linea valida, lo quitamos del nombre del campeon
    const champArgs = laneMap[args[args.length - 1]?.toLowerCase()] ? args.slice(0, -1) : args;
    const champInput = champArgs.join(' ');
    const champNorm = normalizeChampName(champInput);

    let champId = lolChampions.get(champNorm);
    if (!champId) {
        // intentar coincidencia parcial
        for (const [key, val] of lolChampions) {
            if (key.includes(champNorm) || champNorm.includes(key)) {
                champId = val;
                break;
            }
        }
    }
    if (!champId) {
        return message.reply(`No encontre el campeon **${champInput}**. Asegurate de escribirlo bien.`);
    }

    const url = `https://u.gg/lol/champions/${champId}/build?role=${lane}`;
    console.log(`[LOL] Screenshot de ${url}`);
    const loadingMsg = await message.reply(`Buscando build de **${champId}** ${lane}...`);

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
        const page = await context.newPage();

        // --- BLOQUEAR COOKIES: Opcion 1 - cookies de consentimiento ya dadas ---
        // Esto evita que muchos CMPs (Quantcast, OneTrust) muestren el banner
        await context.addCookies([
            { name: 'euconsent-v2', value: 'CPtlrCAPtlrCAAHABBENCsCsAP_AAH_AAAwIINJD7CjfMYUHBgA2oIYQAgSzCQpBGSACACxCRIAQGkgCABABgAAgCQAAQAIQAEDIAAAAAAAAAAEAAABAAAAAAAAAAAAAAgAAAAIAAAAAAAAAAAAAAAEAAAAAAAgAAAAAAAAAAQAAAAABAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', domain: '.u.gg', path: '/' },
            { name: 'cmpuishown', value: 'true', domain: '.u.gg', path: '/' },
            { name: 'notice_behavior', value: 'expressed,eu', domain: '.u.gg', path: '/' },
            { name: 'cookie_consent', value: 'true', domain: '.u.gg', path: '/' },
        ]);

        // --- BLOQUEAR COOKIES: Opcion 2 - abortar scripts conocidos de CMP ---
        await page.route('**/*', (route) => {
            const url = route.request().url();
            const blocked = [
                'quantcast.mgr.consensu.org',
                'sdk.privacy-center.org',
                'cmp.quantcast.com',
                'cdn.cookielaw.org',
                'geolocation.onetrust.com',
                'otSDKStub.js',
                'cookie-law-enforcer',
            ];
            if (blocked.some(b => url.includes(b))) {
                route.abort();
            } else {
                route.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // --- CERRAR MODAL SI AUN ASI APARECE ---
        // Damos margen para que el script del CMP se ejecute (o intente)
        await page.waitForTimeout(2500);

        async function dismissCookieModal(targetPage) {
            // 1. Buscar iframe de Quantcast/Fastly
            const frames = targetPage.frames();
            for (const frame of frames) {
                try {
                    const btn = await frame.locator('button.fc-cta-consent, button[aria-label="Consent"], button.fc-primary-button').first();
                    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                        await btn.click({ timeout: 5000 });
                        console.log('[LOL] Boton Consent clicado (en iframe)');
                        return true;
                    }
                } catch (_) {}
            }

            // 2. Buscar en pagina principal por clases especificas
            try {
                const btn = await targetPage.locator('button.fc-cta-consent').first();
                if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                    await btn.click({ timeout: 5000 });
                    console.log('[LOL] Boton .fc-cta-consent clicado');
                    return true;
                }
            } catch (_) {}

            // 3. Buscar por aria-label exacto
            try {
                const btn = await targetPage.locator('button[aria-label="Consent"]').first();
                if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                    await btn.click({ timeout: 5000 });
                    console.log('[LOL] Boton [aria-label="Consent"] clicado');
                    return true;
                }
            } catch (_) {}

            // 4. Texto exacto en parrafo interno (tu caso concreto)
            try {
                const btn = await targetPage.locator('button:has(p.fc-button-label:has-text("Consent"))').first();
                if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                    await btn.click({ timeout: 5000 });
                    console.log('[LOL] Boton p.fc-button-label Consent clicado');
                    return true;
                }
            } catch (_) {}

            // 5. Otros textos comunes
            const texts = ['Accept', 'Accept All', 'I Accept', 'Aceptar', 'Agree', 'OK', 'Allow All'];
            for (const t of texts) {
                try {
                    const btn = await targetPage.locator(`button:has-text("${t}")`).first();
                    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                        await btn.click({ timeout: 5000 });
                        console.log(`[LOL] Boton "${t}" clicado`);
                        return true;
                    }
                } catch (_) {}
            }

            return false;
        }

        try {
            await dismissCookieModal(page);
        } catch (e) {
            // ignorar
        }

        // --- NUCLEAR OPTION: eliminar TODO rastro del modal del DOM ---
        try {
            await page.evaluate(() => {
                // Clickar cualquier boton sospechoso
                document.querySelectorAll('button').forEach(b => {
                    const txt = (b.textContent || b.innerText || b.getAttribute('aria-label') || '').toLowerCase();
                    if (txt.includes('consent') || txt.includes('accept') || txt.includes('agree') || txt.includes('allow') || txt.includes('ok')) {
                        try { b.click(); } catch (_) {}
                    }
                });

                // Eliminar modales y overlays por selector
                const selectors = [
                    '#cookie-banner', '.cookie-banner', '.cookie-consent', '.cookie-modal',
                    '#cookieConsent', '.qc-cmp2-container', '.onetrust-pc-dark-filter',
                    '#onetrust-consent-sdk', '.cc-banner', '.gdpr-consent',
                    '[class*="fc-"][class*="consent"]', '[class*="fc-"][class*="modal"]',
                    '[class*="cookie"]', '[id*="cookie"]', '[class*="consent"]', '[id*="consent"]',
                    '[class*="modal"]', '[id*="modal"]', '[class*="overlay"]', '[id*="overlay"]',
                    '[class*="backdrop"]', '[id*="backdrop"]',
                ];
                selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => {
                        if (el && el.parentNode) el.parentNode.removeChild(el);
                    });
                });

                // Destruir iframes de consentimiento
                document.querySelectorAll('iframe').forEach(iframe => {
                    const src = iframe.src || '';
                    if (src.includes('quantcast') || src.includes('consensu') || src.includes('privacy') || src.includes('cookie') || src.includes('cmp')) {
                        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                    }
                });

                // Desbloquear scroll
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.documentElement.style.overflow = '';
                document.querySelectorAll('*').forEach(el => {
                    const style = window.getComputedStyle(el);
                    if (style.position === 'fixed' && style.zIndex > 1000) {
                        el.style.display = 'none';
                    }
                });
            });
        } catch (e) {
            // ignorar
        }

        await page.waitForTimeout(1000);

        // --- SELECCIONAR BUILD ALTERNATIVA ---
        if (buildChoice && buildChoice > 1) {
            try {
                const champLower = champId.toLowerCase();
                // Buscar tabs de build: enlaces con href que contiene el campeon y /build
                const tabs = await page.locator(`a[href*="/${champLower}/build"]`).filter({ has: page.locator('div[class*="whitespace-nowrap"]') }).all();
                console.log(`[LOL] Tabs encontrados: ${tabs.length}`);
                if (tabs.length >= buildChoice) {
                    const target = tabs[buildChoice - 1];
                    const href = await target.getAttribute('href');
                    console.log(`[LOL] Clicando tab #${buildChoice} -> ${href}`);
                    await target.click();
                    await page.waitForTimeout(3000); // esperar carga
                } else {
                    console.log(`[LOL] Build alternativa #${buildChoice} no encontrada (${tabs.length} tabs), usando default`);
                }
            } catch (e) {
                console.log('[LOL] Error seleccionando build alternativa:', e.message);
            }
        }

        const runePath = `/tmp/udyr-lol-${champId}-${lane}-runas.png`;
        const skillsPath = `/tmp/udyr-lol-${champId}-${lane}-skills.png`;
        const buildPath = `/tmp/udyr-lol-${champId}-${lane}-build.png`;

        async function screenshotElement(selector, path, label) {
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
                        console.log(`[LOL] Captura de ${label} completada (clip)`);
                        return;
                    }
                }
            } catch (e) {
                console.log(`[LOL] Error capturando ${label}:`, e.message);
            }
            // fallback
            await page.screenshot({ path, fullPage: false });
        }

        await screenshotElement('.rune-spell', runePath, 'runas');
        await screenshotElement('.recommended-build_skills', skillsPath, 'skills');

        // Screenshot 3: Items (incluye 7th item si existe)
        await page.waitForTimeout(500); // Esperar a que el 7th item cargue
        await screenshotElement('.recommended-build_items, [class*="recommended-build_items"]', buildPath, 'items');

        await browser.close();
        browser = null;

        await loadingMsg.delete().catch(() => {});
        await message.channel.send(`Build de **${champId}** en **${lane.toUpperCase()}**\n${url}`);
        await message.channel.send({ files: [runePath] });
        await message.channel.send({ files: [skillsPath] });
        await message.channel.send({ files: [buildPath] });
    } catch (err) {
        console.error('[LOL] Error:', err.message);
        if (browser) await browser.close().catch(() => {});
        await loadingMsg.edit(`No pude obtener la build. Puedes verla aqui: ${url}`);
    }
};

async function handleLolTeam(message) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
        return message.reply('Tienes que estar en un canal de voz para usar este comando.');
    }

    const members = Array.from(voiceChannel.members.values())
        .filter(m => !m.user.bot && m.id !== message.client.user.id)
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
        const champ = getRandomChampionForLane(lane);
        const champName = champ || '???';
        text += `\n${laneEmojis[lane]} **${members[i].toString()}** → ${lane.toUpperCase()}: **${champName}**`;
    }

    message.channel.send(text);
}
