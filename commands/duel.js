function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const CLASSES = {
    tank: {
        name: 'Tanque',
        emoji: '🛡️',
        hp: 130,
        dmgMod: 0.9,
        critChanceMod: -0.05,
        defenseMod: 0.15,
    },
    assassin: {
        name: 'Asesino',
        emoji: '🗡️',
        hp: 80,
        dmgMod: 1.15,
        critChanceMod: 0.15,
        defenseMod: 0,
    },
    mage: {
        name: 'Mago',
        emoji: '🔮',
        hp: 100,
        dmgMod: 1.10,
        critChanceMod: 0.05,
        defenseMod: 0.05,
    },
    marksman: {
        name: 'Tirador',
        emoji: '🏹',
        hp: 90,
        dmgMod: 1.05,
        critChanceMod: 0.10,
        defenseMod: 0,
    },
};

const PASSIVES = [
    {
        name: 'Ira Berserker',
        desc: 'Al bajar de 30 HP, recupera 15 HP una vez.',
        onLowHp: (p) => {
            if (!p.passiveUsed && p.hp <= 30) {
                p.hp = Math.min(p.maxHp, p.hp + 15);
                p.passiveUsed = true;
                return `🔥 **¡${p.name} entra en Ira Berserker!** Recupera **15 HP**.`;
            }
            return null;
        },
    },
    {
        name: 'Escudo de Hielo',
        desc: 'El primer ataque recibido inflige 0 daño.',
        onHit: (p) => {
            if (!p.passiveUsed) {
                p.passiveUsed = true;
                return `🧊 **¡Escudo de Hielo!** ${p.name} anula el primer golpe recibido.`;
            }
            return null;
        },
    },
    {
        name: 'Furia del Viento',
        desc: 'Cada 3 turnos, el ataque ignora defensa y parry.',
        onAttack: (p) => {
            p.turnCounter = (p.turnCounter || 0) + 1;
            if (p.turnCounter % 3 === 0) {
                return { ignoreDefense: true, text: `🌪️ **¡Furia del Viento!** El ataque de ${p.name} ignora toda defensa.` };
            }
            return null;
        },
    },
    {
        name: 'Vampirismo',
        desc: 'Cada ataque normal cura un 25% del daño infligido.',
        onDamageDealt: (p, dmg) => {
            const heal = Math.floor(dmg * 0.25);
            p.hp = Math.min(p.maxHp, p.hp + heal);
            return `🩸 **Vampirismo:** ${p.name} recupera **${heal} HP**.`;
        },
    },
    {
        name: 'Contraataque',
        desc: 'Tras recibir un crítico, el siguiente ataque hace +50% de daño.',
        onCritReceived: (p) => {
            p.buffCounter = 2;
            return `⚡ **¡Contraataque cargado!** El siguiente ataque de ${p.name} hará +50% de daño.`;
        },
    },
];

function rollClass() {
    const keys = Object.keys(CLASSES);
    return keys[Math.floor(Math.random() * keys.length)];
}

function rollPassive() {
    return PASSIVES[Math.floor(Math.random() * PASSIVES.length)];
}

function generateStats() {
    return {
        strength: randomInt(8, 15),
        agility: randomInt(8, 15),
        defense: randomInt(8, 15),
    };
}

function buildEmbed(p1, p2, roundText, turn, log) {
    const hpBar = (p) => {
        const pct = Math.max(0, p.hp / p.maxHp);
        const filled = Math.max(0, Math.ceil(pct * 10));
        const empty = 10 - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${Math.max(0, p.hp)}/${p.maxHp} HP`;
    };

    return {
        color: 0x9b59b6,
        title: `⚔️ Duelo — Ronda ${turn}`,
        description: roundText || 'Preparando...',
        fields: [
            {
                name: `${p1.classData.emoji} ${p1.name} (${p1.classData.name})`,
                value: `${hpBar(p1)}\n🗡️ Fuerza: ${p1.stats.strength} | 🦶 Agilidad: ${p1.stats.agility} | 🛡️ Defensa: ${p1.stats.defense}\n✨ Pasiva: *${p1.passive.name}*`,
                inline: true,
            },
            {
                name: `${p2.classData.emoji} ${p2.name} (${p2.classData.name})`,
                value: `${hpBar(p2)}\n🗡️ Fuerza: ${p2.stats.strength} | 🦶 Agilidad: ${p2.stats.agility} | 🛡️ Defensa: ${p2.stats.defense}\n✨ Pasiva: *${p2.passive.name}*`,
                inline: true,
            },
        ],
        footer: { text: `Log de combate: ${log.slice(-3).join(' | ')}` },
    };
}

module.exports = async function handleDuel(message, args) {
    const mentioned = message.mentions.users.first();
    if (!mentioned) {
        return message.reply('Tienes que mencionar a alguien. Ejemplo: `udyr retar @usuario`');
    }
    if (mentioned.id === message.author.id) {
        return message.reply('No puedes retarte a ti mismo.');
    }
    if (mentioned.bot) {
        return message.reply('No puedes retar a un bot.');
    }

    // Crear jugadores
    const makePlayer = (user) => {
        const clsKey = rollClass();
        const cls = CLASSES[clsKey];
        const stats = generateStats();
        const passive = rollPassive();
        return {
            user,
            name: user.displayName || user.username,
            hp: cls.hp,
            maxHp: cls.hp,
            classKey: clsKey,
            classData: cls,
            stats,
            passive,
            passiveUsed: false,
            buffCounter: 0,
            comboCount: 0,
            turnCounter: 0,
        };
    };

    const p1 = makePlayer(message.author);
    const p2 = makePlayer(mentioned);

    let attacker = p1;
    let defender = p2;
    let turn = 0;
    const fullLog = [];

    // Presentacion inicial
    const introEmbed = {
        color: 0xe74c3c,
        title: '⚔️ ¡DUELO!',
        description: `${p1.user.toString()} **VS** ${p2.user.toString()}`,
        fields: [
            {
                name: `${p1.classData.emoji} ${p1.name} — ${p1.classData.name}`,
                value: `HP: ${p1.maxHp} | Fuerza: ${p1.stats.strength} | Agilidad: ${p1.stats.agility} | Defensa: ${p1.stats.defense}\nPasiva: *${p1.passive.name}* — ${p1.passive.desc}`,
            },
            {
                name: `${p2.classData.emoji} ${p2.name} — ${p2.classData.name}`,
                value: `HP: ${p2.maxHp} | Fuerza: ${p2.stats.strength} | Agilidad: ${p2.stats.agility} | Defensa: ${p2.stats.defense}\nPasiva: *${p2.passive.name}* — ${p2.passive.desc}`,
            },
        ],
    };

    const duelMsg = await message.channel.send({ embeds: [introEmbed] });

    // Apuestas: añadir reacciones para que el chat apueste
    try {
        await duelMsg.react('🟥');
        await duelMsg.react('🟦');
    } catch (_) {}

    await sleep(4000);

    // Bucle de combate
    while (p1.hp > 0 && p2.hp > 0) {
        turn++;
        let roundLines = [];
        let damage = 0;
        let isCrit = false;
        let isParry = false;
        let isDefend = false;

        // Muerte súbita: ronda 11+, daño x1.5
        const suddenDeath = turn >= 11;
        const suddenMult = suddenDeath ? 1.5 : 1;

        const baseRoll = Math.random();

        // Pasiva: Furia del Viento (ignora defensa cada 3 turnos)
        let ignoreDefense = false;
        if (attacker.passive.onAttack) {
            const passiveResult = attacker.passive.onAttack(attacker);
            if (passiveResult) {
                ignoreDefense = passiveResult.ignoreDefense;
                roundLines.push(passiveResult.text);
            }
        }

        // Probabilidades modificadas por clase y stats
        const agiDiff = attacker.stats.agility - defender.stats.agility;
        const parryChance = Math.max(0.05, Math.min(0.20, 0.10 + agiDiff * 0.01));
        const critChance = Math.max(0.05, Math.min(0.35, 0.15 + attacker.stats.strength * 0.01 + attacker.classData.critChanceMod));
        const defendChance = Math.max(0.05, Math.min(0.25, 0.10 + defender.stats.defense * 0.01 + defender.classData.defenseMod));

        if (!ignoreDefense && baseRoll < parryChance) {
            // Parry
            const baseDmg = randomInt(10, 25);
            const reflected = Math.max(1, Math.floor((baseDmg / 2) * attacker.classData.dmgMod * suddenMult));
            attacker.hp -= reflected;
            roundLines.push(`🥷 **¡PARRY!** ${defender.name} devuelve el golpe. ${attacker.name} recibe **${reflected}** de daño.`);
            isParry = true;
        } else if (!ignoreDefense && baseRoll < parryChance + defendChance) {
            // Defensa
            roundLines.push(`🛡️ ${defender.name} se defiende perfectamente. **0** de daño.`);
            isDefend = true;
        } else if (baseRoll < parryChance + defendChance + critChance) {
            // Crítico
            damage = Math.floor(randomInt(12, 22) * attacker.classData.dmgMod * suddenMult);

            // Combos: si ya tenía 1 crítico acumulado, este es el segundo → ataque especial
            if (attacker.comboCount >= 1) {
                damage = Math.floor(damage * 2.5);
                roundLines.push(`💥💥 **¡COMBO ESPECIAL!** ${attacker.name} encadena críticos y desata un golpe devastador.`);
                attacker.comboCount = 0;
            } else {
                roundLines.push(`💥 **¡CRÍTICO!** ${attacker.name} inflige **${damage}** de daño.`);
                attacker.comboCount = 1;
            }

            defender.hp -= damage;
            isCrit = true;

            // Pasiva del defensor al recibir crítico
            if (defender.passive.onCritReceived) {
                const passiveText = defender.passive.onCritReceived(defender);
                if (passiveText) roundLines.push(passiveText);
            }
        } else {
            // Ataque normal
            damage = Math.floor(randomInt(8, 18) * attacker.classData.dmgMod * suddenMult);

            // Doble ataque para Marksman (20%)
            let doubleHit = false;
            if (attacker.classKey === 'marksman' && Math.random() < 0.20) {
                doubleHit = true;
                damage = Math.floor(damage * 1.8);
            }

            defender.hp -= damage;
            attacker.comboCount = 0;

            if (doubleHit) {
                roundLines.push(`🏹 **¡Doble Disparo!** ${attacker.name} ataca dos veces e inflige **${damage}** de daño.`);
            } else {
                roundLines.push(`👊 ${attacker.name} ataca e inflige **${damage}** de daño.`);
            }

            // Pasiva vampirismo
            if (attacker.passive.onDamageDealt) {
                const vampText = attacker.passive.onDamageDealt(attacker, damage);
                if (vampText) roundLines.push(vampText);
            }
        }

        // Pasiva: Ira Berserker (al bajar de 30 HP)
        for (const p of [p1, p2]) {
            if (p.passive.onLowHp) {
                const lowHpText = p.passive.onLowHp(p);
                if (lowHpText) roundLines.push(lowHpText);
            }
        }

        // Pasiva: Contraataque (buff de daño +50%)
        if (attacker.buffCounter > 0) {
            attacker.buffCounter = 0; // se consume al atacar
        }

        // Muerte súbita aviso
        if (turn === 11) {
            roundLines.push(`☠️ **¡MUERTE SÚBITA!** El daño se incrementa un 50%.`);
        }

        fullLog.push(`R${turn}: ${attacker.name} → ${isCrit ? 'Crit' : isParry ? 'Parry' : isDefend ? 'Def' : 'Hit'} (${Math.max(0, defender.hp)} HP ${defender.name})`);

        // Editar mensaje
        const embed = buildEmbed(p1, p2, roundLines.join('\n'), turn, fullLog);
        if (suddenDeath) {
            embed.title = `☠️ Muerte Súbita — Ronda ${turn}`;
            embed.color = 0xe74c3c;
        }
        await duelMsg.edit({ embeds: [embed] });

        // Cambiar turnos
        [attacker, defender] = [defender, attacker];

        if (p1.hp > 0 && p2.hp > 0) {
            await sleep(3000);
        }
    }

    await sleep(2000);

    // Resultado final
    const winner = p1.hp > 0 ? p1 : p2;
    const loser = p1.hp > 0 ? p2 : p1;

    const finalEmbed = {
        color: 0xf1c40f,
        title: '🏆 ¡DUELO TERMINADO!',
        description: `**${winner.name}** derrota a **${loser.name}** en ${turn} rondas.`,
        fields: [
            {
                name: 'Resumen del combate',
                value: fullLog.slice(0, 20).join('\n') || 'Sin datos',
            },
        ],
    };

    await duelMsg.edit({ embeds: [finalEmbed] });
    await message.channel.send(`🎉 ¡Enhorabuena ${winner.user.toString()}! Has ganado el duelo.`);
};
