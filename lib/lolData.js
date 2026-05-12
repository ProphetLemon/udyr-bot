const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { newUggPage } = require('./uggBrowser');

let lolChampions = new Map(); // nombre ES normalizado / id minúsculas -> ID canónico EN
let currentVersion = null;

const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'lane-tierlists.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const laneChampionsFallback = {
    top: ['Aatrox','Camille','Darius','Fiora','Gangplank','Garen','Gnar','Gragas','Gwen','Illaoi','Irelia','Jax','Jayce','Kennen','Kled','KSante','Malphite','Maokai','Mordekaiser','Nasus','Ornn','Poppy','Quinn','Renekton','Riven','Rumble','Sett','Shen','Singed','Sion','TahmKench','Teemo','Trundle','Tryndamere','Urgot','Volibear','Wukong','Yasuo','Yone','Yorick','Chogath','DrMundo','Olaf'],
    jungle: ['Amumu','Belveth','Briar','Diana','Ekko','Elise','Evelynn','Fiddlesticks','Graves','Gwen','Hecarim','Ivern','JarvanIV','Karthus','Khazix','Kindred','LeeSin','Lillia','Maokai','MasterYi','Nidalee','Nocturne','Nunu','Olaf','Poppy','Rammus','RekSai','Rengar','Sejuani','Shaco','Shyvana','Skarner','Taliyah','Trundle','Udyr','Vi','Viego','Volibear','Warwick','Wukong','XinZhao','Zac','Gragas','Rumble'],
    mid: ['Ahri','Akali','Akshan','Anivia','Annie','AurelionSol','Azir','Cassiopeia','Corki','Ekko','Fizz','Galio','Heimerdinger','Hwei','Irelia','Jayce','Kassadin','Katarina','Leblanc','Lissandra','Lux','Malzahar','Naafiri','Neeko','Orianna','Qiyana','Ryze','Sylas','Syndra','Taliyah','Talon','TwistedFate','Veigar','Velkoz','Vex','Viktor','Vladimir','Xerath','Yasuo','Yone','Zed','Ziggs','Zoe','Smolder','Aurora'],
    adc: ['Aphelios','Ashe','Caitlyn','Draven','Ezreal','Jhin','Jinx','Kaisa','Kalista','KogMaw','Lucian','MissFortune','Nilah','Samira','Senna','Sivir','Smolder','Tristana','Twitch','Varus','Vayne','Xayah','Zeri'],
    support: ['Alistar','Bard','Blitzcrank','Brand','Braum','Janna','Karma','Leona','Lulu','Lux','Maokai','Malphite','Milio','Morgana','Nami','Nautilus','Pantheon','Pyke','Rakan','Rell','Renata','Senna','Seraphine','Sona','Soraka','Swain','TahmKench','Taric','Thresh','Velkoz','Xerath','Yuumi','Zilean','Zyra','Amumu','Ashe','Camille','Galio'],
};

let laneChampions = { ...laneChampionsFallback };

const ROLE_URLS = {
    top:     'https://u.gg/lol/top-lane-tier-list',
    jungle:  'https://u.gg/lol/jungle-tier-list',
    mid:     'https://u.gg/lol/mid-lane-tier-list',
    adc:     'https://u.gg/lol/adc-tier-list',
    support: 'https://u.gg/lol/support-tier-list',
};

function normalizeChampName(name) {
    return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

async function loadLolChampions() {
    try {
        const versionRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        currentVersion = versionRes.data[0];
        const res = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/es_ES/champion.json`);
        const champs = res.data.data;
        for (const key in champs) {
            const champ = champs[key];
            const nameNorm = normalizeChampName(champ.name);
            lolChampions.set(nameNorm, champ.id);
            lolChampions.set(key.toLowerCase(), champ.id);
        }
        console.log(`[LOL] ${lolChampions.size} nombres de campeones cargados (patch ${currentVersion}).`);
    } catch (e) {
        console.error('[LOL] Error cargando campeones:', e.message);
    }
}

function readCache() {
    try {
        const raw = fs.readFileSync(CACHE_FILE, 'utf8');
        const { timestamp, data } = JSON.parse(raw);
        if (!timestamp || !data) return null;
        if (Date.now() - timestamp > CACHE_TTL_MS) return null;
        return data;
    } catch {
        return null;
    }
}

function writeCache(data) {
    try {
        if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
        fs.writeFileSync(CACHE_FILE, JSON.stringify({ timestamp: Date.now(), data }, null, 2));
    } catch (e) {
        console.log('[LOL] No pude escribir cache:', e.message);
    }
}

async function scrapeRole(page, role, url) {
    const byId = new Map();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        try {
            await page.waitForSelector('.rt-tbody .rt-tr-group', { timeout: 15000 });
        } catch {
            console.log(`[LOL] ${role}: tabla no aparecio`);
            return [];
        }
        await page.waitForTimeout(800);

        const extractVisible = () => page.evaluate(() => {
            const out = [];
            document.querySelectorAll('.rt-tbody .rt-tr-group').forEach(row => {
                const link = row.querySelector('.rt-td.champion a[href*="/lol/champions/"]');
                const rankEl = row.querySelector('.rt-td.rank span');
                if (!link) return;
                const m = (link.getAttribute('href') || '').match(/\/lol\/champions\/([^\/\?#]+)/);
                if (!m) return;
                const rank = rankEl ? parseInt(rankEl.textContent, 10) : null;
                out.push({ id: m[1], rank: Number.isFinite(rank) ? rank : null });
            });
            return out;
        });

        let stableRounds = 0;
        for (let i = 0; i < 50; i++) {
            const visible = await extractVisible();
            const sizeBefore = byId.size;
            for (const { id, rank } of visible) {
                if (id.length > 1 && id !== 'build' && !id.includes('tier-list') && !byId.has(id)) {
                    byId.set(id, rank ?? 9999);
                }
            }
            if (byId.size === sizeBefore) {
                stableRounds++;
                if (stableRounds >= 4) break;
            } else {
                stableRounds = 0;
            }
            await page.evaluate(() => window.scrollBy(0, 500));
            await page.waitForTimeout(350);
        }
    } catch (e) {
        console.log(`[LOL] ${role}: error scrapeando: ${e.message}`);
    }

    return [...byId.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([id]) => id);
}

async function scrapeAllTierlists() {
    console.log('[LOL] Scrapeando tierlists de u.gg...');
    let release = () => {};
    const scraped = { top: [], jungle: [], mid: [], adc: [], support: [] };
    try {
        const session = await newUggPage({ width: 1920, height: 1080 });
        release = session.release;
        for (const [role, url] of Object.entries(ROLE_URLS)) {
            scraped[role] = await scrapeRole(session.page, role, url);
            console.log(`[LOL] ${role}: ${scraped[role].length} champs`);
        }
    } catch (e) {
        console.log(`[LOL] Error scrapeando: ${e.message}`);
    } finally {
        await release();
    }
    return scraped;
}

function normalizeScraped(scraped) {
    const normalized = { top: [], jungle: [], mid: [], adc: [], support: [] };
    for (const lane of Object.keys(scraped)) {
        for (const id of scraped[lane]) {
            const canonical = lolChampions.get(id.toLowerCase());
            if (canonical && !normalized[lane].includes(canonical)) {
                normalized[lane].push(canonical);
            }
        }
    }
    return normalized;
}

function applyNormalized(normalized) {
    const validCount = Object.values(normalized).filter(arr => arr.length >= 5).length;
    if (validCount < 3) return false;
    for (const lane of Object.keys(laneChampions)) {
        if (normalized[lane].length >= 5) laneChampions[lane] = normalized[lane];
    }
    console.log(`[LOL] Lineas: top=${laneChampions.top.length} jg=${laneChampions.jungle.length} mid=${laneChampions.mid.length} adc=${laneChampions.adc.length} sup=${laneChampions.support.length}`);
    return true;
}

async function loadLaneChampions() {
    const cached = readCache();
    if (cached) {
        if (applyNormalized(cached)) {
            console.log('[LOL] Tierlists cargados desde cache.');
            return;
        }
    }

    const scraped = await scrapeAllTierlists();
    const normalized = normalizeScraped(scraped);
    if (applyNormalized(normalized)) {
        writeCache(normalized);
    } else {
        console.log('[LOL] Scrapeo insuficiente, usando fallback estatico.');
    }
}

function getRandomChampionForLane(lane) {
    const ids = laneChampions[lane];
    if (!ids || ids.length === 0) return null;
    if (lolChampions.size === 0) {
        return ids[Math.floor(Math.random() * ids.length)];
    }
    const available = ids.filter(id => lolChampions.has(id.toLowerCase()));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

module.exports = {
    lolChampions,
    loadLolChampions,
    loadLaneChampions,
    normalizeChampName,
    laneChampions,
    getRandomChampionForLane,
};
