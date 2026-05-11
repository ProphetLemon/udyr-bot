const axios = require('axios');
const { chromium } = require('playwright');

let lolChampions = new Map(); // nombre ES normalizado -> ID EN
let currentVersion = null;

// Fallback estatico (por si todo falla)
const laneChampionsFallback = {
    top: ['Aatrox','Camille','Darius','Fiora','Gangplank','Garen','Gnar','Gragas','Gwen','Illaoi','Irelia','Jax','Jayce','Kennen','Kled','KSante','Malphite','Maokai','Mordekaiser','Nasus','Ornn','Poppy','Quinn','Renekton','Riven','Rumble','Sett','Shen','Singed','Sion','TahmKench','Teemo','Trundle','Tryndamere','Urgot','Volibear','Wukong','Yasuo','Yone','Yorick','Chogath','DrMundo','Olaf'],
    jungle: ['Amumu','Belveth','Briar','Diana','Ekko','Elise','Evelynn','Fiddlesticks','Graves','Gwen','Hecarim','Ivern','JarvanIV','Karthus','Khazix','Kindred','LeeSin','Lillia','Maokai','MasterYi','Nidalee','Nocturne','Nunu','Olaf','Poppy','Rammus','RekSai','Rengar','Sejuani','Shaco','Shyvana','Skarner','Taliyah','Trundle','Udyr','Vi','Viego','Volibear','Warwick','Wukong','XinZhao','Zac','Gragas','Rumble'],
    mid: ['Ahri','Akali','Akshan','Anivia','Annie','AurelionSol','Azir','Cassiopeia','Corki','Ekko','Fizz','Galio','Heimerdinger','Hwei','Irelia','Jayce','Kassadin','Katarina','Leblanc','Lissandra','Lux','Malzahar','Naafiri','Neeko','Orianna','Qiyana','Ryze','Sylas','Syndra','Taliyah','Talon','TwistedFate','Veigar','Velkoz','Vex','Viktor','Vladimir','Xerath','Yasuo','Yone','Zed','Ziggs','Zoe','Smolder','Aurora'],
    adc: ['Aphelios','Ashe','Caitlyn','Draven','Ezreal','Jhin','Jinx','Kaisa','Kalista','KogMaw','Lucian','MissFortune','Nilah','Samira','Senna','Sivir','Smolder','Tristana','Twitch','Varus','Vayne','Xayah','Zeri'],
    support: ['Alistar','Bard','Blitzcrank','Brand','Braum','Janna','Karma','Leona','Lulu','Lux','Maokai','Malphite','Milio','Morgana','Nami','Nautilus','Pantheon','Pyke','Rakan','Rell','Renata','Senna','Seraphine','Sona','Soraka','Swain','TahmKench','Taric','Thresh','Velkoz','Xerath','Yuumi','Zilean','Zyra','Amumu','Ashe','Camille','Galio'],
};

let laneChampions = { ...laneChampionsFallback };

function normalizeChampName(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
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

async function loadLaneChampions() {
    console.log('[LOL] Scrapeando tierlists de u.gg para obtener lineas dinamicas...');
    let browser;
    try {
        browser = await chromium.launch({ headless: true });

        const roles = [
            { key: 'top', url: 'https://u.gg/lol/tier-list?role=top' },
            { key: 'jungle', url: 'https://u.gg/lol/tier-list?role=jungle' },
            { key: 'mid', url: 'https://u.gg/lol/tier-list?role=mid' },
            { key: 'adc', url: 'https://u.gg/lol/tier-list?role=adc' },
            { key: 'support', url: 'https://u.gg/lol/tier-list?role=support' },
        ];

        const scraped = { top: [], jungle: [], mid: [], adc: [], support: [] };

        for (const role of roles) {
            let page;
            try {
                // Crear nueva pagina para cada rol (evita que se cierre entre navegaciones)
                const context = await browser.newContext();
                page = await context.newPage();

                await page.goto(role.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForTimeout(3000); // esperar carga inicial

                // Scroll infinito para cargar toda la tabla
                let previousCount = 0;
                let stableRounds = 0;
                for (let scroll = 0; scroll < 20; scroll++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(600);
                    const currentCount = await page.evaluate(() => {
                        return document.querySelectorAll('a[href^="/lol/champions/"]').length;
                    });
                    if (currentCount === previousCount) {
                        stableRounds++;
                        if (stableRounds >= 3) break;
                    } else {
                        stableRounds = 0;
                        previousCount = currentCount;
                    }
                }

                // Extraer IDs de campeones directamente de los hrefs
                const ids = await page.evaluate(() => {
                    const results = new Set();
                    const seen = new Set();
                    const links = document.querySelectorAll('a[href*="/lol/champions/"]');
                    for (const link of links) {
                        const href = link.getAttribute('href') || '';
                        const match = href.match(/\/lol\/champions\/([^\/\?#]+)/);
                        if (match && match[1]) {
                            const id = match[1];
                            // Evitar duplicados y valores genericos
                            if (!seen.has(id) && id.length > 1 && id !== 'build' && !id.includes('tier-list')) {
                                seen.add(id);
                                results.add(id);
                            }
                        }
                    }
                    return Array.from(results);
                });

                if (ids.length >= 5) {
                    scraped[role.key] = ids;
                    console.log(`[LOL] ${role.key}: ${ids.length} champs scrapeados`);
                } else {
                    console.log(`[LOL] ${role.key}: pocos resultados (${ids.length}), usando fallback`);
                }

                await page.close();
                await context.close();
            } catch (e) {
                console.log(`[LOL] Error scrapeando ${role.key}: ${e.message}`);
                if (page) await page.close().catch(() => {});
            }
        }

        await browser.close();
        browser = null;

        // Filtrar IDs scrapeados contra Data Dragon para validar
        const normalized = { top: [], jungle: [], mid: [], adc: [], support: [] };
        for (const lane of Object.keys(scraped)) {
            for (const id of scraped[lane]) {
                const idLower = id.toLowerCase();
                if (lolChampions.has(idLower) && !normalized[lane].includes(id)) {
                    normalized[lane].push(id);
                }
            }
        }

        const validCount = Object.values(normalized).filter(arr => arr.length >= 5).length;
        if (validCount >= 3) {
            laneChampions = normalized;
            console.log(`[LOL] Lineas actualizadas dinamicamente: top=${laneChampions.top.length}, jg=${laneChampions.jungle.length}, mid=${laneChampions.mid.length}, adc=${laneChampions.adc.length}, sup=${laneChampions.support.length}`);
        } else {
            console.log('[LOL] Scrapeo insuficiente, usando fallback estatico.');
        }
    } catch (e) {
        console.log(`[LOL] Error general en scrapeo: ${e.message}. Usando fallback.`);
        if (browser) await browser.close().catch(() => {});
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
