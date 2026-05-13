const { chromium } = require('playwright');

const IDLE_TIMEOUT_MS = 60_000; // cierra el browser si nadie lo usa por 60s

let browser = null;
let inFlight = 0;
let idleTimer = null;

const CONSENT_COOKIES = [
    {
        name: 'euconsent-v2',
        value:
            'CPtlrCAPtlrCAAHABBENCsCsAP_AAH_AAAwIINJD7CjfMYUHBgA2oIYQAgSzCQpBGSACACxCRIAQGkgCABABgAAgCQAAQAIQAEDIAAAAAAAAAAEAAABAAAAAAAAAAAAAAgAAAAIAAAAAAAAAAAAAAAEAAAAAAAgAAAAAAAAAAQAAAAABAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        domain: '.u.gg',
        path: '/',
    },
    { name: 'cmpuishown', value: 'true', domain: '.u.gg', path: '/' },
    { name: 'notice_behavior', value: 'expressed,eu', domain: '.u.gg', path: '/' },
    { name: 'cookie_consent', value: 'true', domain: '.u.gg', path: '/' },
];

const BLOCKED_PATTERNS = [
    '**/*quantcast*',
    '**/*consensu*',
    '**/*cookielaw*',
    '**/*onetrust*',
    '**/*otSDK*',
    '**/*cookie-law*',
    '**/*cmp*',
];

const ANTI_CMP_INIT_SCRIPT = () => {
    const KILL_SELECTORS = [
        '.qc-cmp2-container',
        '#qc-cmp2-ui',
        '.fc-consent-root',
        '[class*="fc-dialog"]',
        '[id*="cmp"]',
        '[class*="cmp-"]',
    ];
    const nuke = () => {
        for (const sel of KILL_SELECTORS) {
            document.querySelectorAll(sel).forEach((el) => el.remove());
        }
        document.querySelectorAll('iframe').forEach((f) => {
            const s = (f.src || '') + ' ' + (f.title || '');
            if (/quantcast|consensu|cmp|consent|fastly/i.test(s)) f.remove();
        });
        if (document.body) {
            document.body.style.overflow = '';
            document.body.style.position = '';
        }
    };
    const obs = new MutationObserver(nuke);
    const start = () => {
        if (!document.body) return setTimeout(start, 50);
        obs.observe(document.body, { childList: true, subtree: true });
        nuke();
    };
    start();
};

function scheduleIdleClose() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(async () => {
        if (inFlight === 0 && browser) {
            const b = browser;
            browser = null;
            await b.close().catch(() => {});
            console.log('[UGG] Browser cerrado por inactividad');
        }
    }, IDLE_TIMEOUT_MS);
}

async function getBrowser() {
    if (browser && browser.isConnected()) return browser;
    browser = await chromium.launch({ headless: true });
    browser.on('disconnected', () => {
        if (browser && !browser.isConnected()) browser = null;
    });
    return browser;
}

/**
 * Crea un context+page de u.gg con anti-CMP. Devuelve { context, page, release }.
 * Llama release() siempre, idealmente en un finally, para cerrar el context y
 * permitir que el browser se cierre por inactividad.
 */
async function newUggPage(viewport = { width: 1280, height: 900 }) {
    inFlight++;
    if (idleTimer) clearTimeout(idleTimer);

    const b = await getBrowser();
    const context = await b.newContext({ viewport });

    await context.addInitScript(ANTI_CMP_INIT_SCRIPT);
    await context.addCookies(CONSENT_COOKIES);

    const page = await context.newPage();
    for (const pattern of BLOCKED_PATTERNS) {
        await page.route(pattern, (route) => route.abort());
    }

    let released = false;
    const release = async () => {
        if (released) return;
        released = true;
        await context.close().catch(() => {});
        inFlight = Math.max(0, inFlight - 1);
        if (inFlight === 0) scheduleIdleClose();
    };

    return { context, page, release };
}

async function shutdown() {
    if (idleTimer) clearTimeout(idleTimer);
    if (browser) {
        const b = browser;
        browser = null;
        await b.close().catch(() => {});
    }
}

module.exports = { newUggPage, shutdown };
