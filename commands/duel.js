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
        defenseMod: 0.08,
        mechanic: {
            name: 'Piel de Piedra',
            onReceiveDamage: (p, dmg) => Math.max(1, Math.floor(dmg * 0.85)),
        },
    },
    assassin: {
        name: 'Asesino',
        emoji: '🗡️',
        hp: 80,
        dmgMod: 1.15,
        critChanceMod: 0.15,
        defenseMod: -0.05,
        mechanic: {
            name: 'Golpe Sombra',
            procChance: 0.15,
        },
    },
    mage: {
        name: 'Mago',
        emoji: '🔮',
        hp: 100,
        dmgMod: 1.10,
        critChanceMod: 0.05,
        defenseMod: 0.03,
        mechanic: {
            name: 'Explosión Arcana',
            procChance: 0.20,
        },
    },
    marksman: {
        name: 'Tirador',
        emoji: '🏹',
        hp: 90,
        dmgMod: 1.05,
        critChanceMod: 0.10,
        defenseMod: -0.02,
        mechanic: {
            name: 'Doble Disparo',
            procChance: 0.25,
        },
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
                return { blocked: true, text: `🧊 **¡Escudo de Hielo!** ${p.name} anula el primer golpe recibido.` };
            }
            return null;
        },
    },
    {
        name: 'Vampirismo',
        desc: 'Cada ataque normal cura un 25% del daño total infligido.',
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
            p.buffCounter = 1;
            return `⚡ **¡Contraataque cargado!** El siguiente ataque de ${p.name} hará +50% de daño.`;
        },
    },
    {
        name: 'Viento Cortante',
        desc: 'Cada 3 turnos propios, el ataque ignora defensa y parry.',
        onAttack: (p) => {
            p.turnCounter = (p.turnCounter || 0) + 1;
            if (p.turnCounter % 3 === 0) {
                return { ignoreDefense: true, text: `🌪️ **¡Viento Cortante!** El ataque de ${p.name} atraviesa toda defensa.` };
            }
            return null;
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

function applyDamageToTarget(target, rawDamage, roundLines, ignoreDefense) {
    let dmg = rawDamage;

    if (ignoreDefense) {
        return dmg;
    }

    // Escudo de Hielo primero (puede anular todo)
    if (target.passive.onHit) {
        const hitResult = target.passive.onHit(target);
        if (hitResult && hitResult.blocked) {
            roundLines.push(hitResult.text);
            return 0;
        }
    }

    // Piel de Piedra reduce daño
    if (target.classData.mechanic.onReceiveDamage) {
        const reduced = target.classData.mechanic.onReceiveDamage(target, dmg);
        if (reduced < dmg) {
            roundLines.push(`🛡️ **Piel de Piedra** reduce el daño de **${dmg}** a **${reduced}**.`);
            dmg = reduced;
        }
    }

    return dmg;
}

function buildEmbed(p1, p2, roundText, turn) {
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

    let attacker = Math.random() < 0.5 ? p1 : p2;
    let defender = attacker === p1 ? p2 : p1;
    let turn = 0;

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

    try {
        await duelMsg.react('🟥');
        await duelMsg.react('🟦');
    } catch (_) {}

    await sleep(4000);

    while (p1.hp > 0 && p2.hp > 0) {
        turn++;
        const roundLines = [];

        const suddenDeath = turn >= 11;
        const suddenMult = suddenDeath ? 1.5 : 1;

        // --- FASE 1: Pasiva de ataque (Viento Cortante) ---
        let ignoreDefense = false;
        if (attacker.passive.onAttack) {
            const passiveResult = attacker.passive.onAttack(attacker);
            if (passiveResult) {
                ignoreDefense = passiveResult.ignoreDefense;
                roundLines.push(passiveResult.text);
            }
        }

        // --- FASE 2: Calcular probabilidades ---
        const agiDiff = attacker.stats.agility - defender.stats.agility;
        const strBonus = attacker.stats.strength - 11; // 11 es la media (8-15)
        const defBonus = defender.stats.defense - 11;

        const parryChance = Math.max(0.05, Math.min(0.20, 0.10 + agiDiff * 0.02));
        const critChance = Math.max(0.05, Math.min(0.40, 0.15 + strBonus * 0.02 + attacker.classData.critChanceMod));
        const defendChance = Math.max(0.05, Math.min(0.20, 0.10 + defBonus * 0.02 + defender.classData.defenseMod));

        const roll = Math.random();

        // --- FASE 3: Resolver ataque ---
        let damage = 0;
        let totalDamageDealt = 0;

        if (!ignoreDefense && roll < parryChance) {
            // Parry
            const baseDmg = randomInt(10, 25);
            let reflected = Math.max(1, Math.floor((baseDmg / 2) * attacker.classData.dmgMod * suddenMult));

            // Contraataque buff aplica también al daño reflejado
            if (defender.buffCounter > 0) {
                reflected = Math.floor(reflected * 1.5);
                defender.buffCounter = 0;
            }

            // Piel de Piedra del atacante reduce daño recibido
            if (attacker.classData.mechanic.onReceiveDamage) {
                reflected = attacker.classData.mechanic.onReceiveDamage(attacker, reflected);
            }

            attacker.hp -= reflected;
            roundLines.push(`🥷 **¡PARRY!** ${defender.name} devuelve el golpe. ${attacker.name} recibe **${reflected}** de daño.`);
        } else if (!ignoreDefense && roll < parryChance + defendChance) {
            // Defensa
            roundLines.push(`🛡️ ${defender.name} se defiende perfectamente. **0** de daño.`);
        } else if (roll < parryChance + defendChance + critChance) {
            // Crítico
            damage = Math.floor(randomInt(12, 22) * attacker.classData.dmgMod * suddenMult);

            // Aplicar buff de Contraataque
            if (attacker.buffCounter > 0) {
                damage = Math.floor(damage * 1.5);
                attacker.buffCounter = 0;
            }

            // Combo especial
            if (attacker.comboCount >= 1) {
                damage = Math.floor(damage * 2.5);
                roundLines.push(`💥💥 **¡COMBO ESPECIAL!** ${attacker.name} encadena críticos y desata un golpe devastador por **${damage}** de daño.`);
                attacker.comboCount = 0;
            } else {
                roundLines.push(`💥 **¡CRÍTICO!** ${attacker.name} inflige **${damage}** de daño.`);
                attacker.comboCount = 1;
            }

            damage = applyDamageToTarget(defender, damage, roundLines, ignoreDefense);
            totalDamageDealt = damage;
            defender.hp -= damage;

            // Pasiva del defensor al recibir crítico
            if (defender.passive.onCritReceived) {
                const passiveText = defender.passive.onCritReceived(defender);
                if (passiveText) roundLines.push(passiveText);
            }
        } else {
            // Ataque normal
            damage = Math.floor(randomInt(8, 18) * attacker.classData.dmgMod * suddenMult);

            // Aplicar buff de Contraataque
            if (attacker.buffCounter > 0) {
                damage = Math.floor(damage * 1.5);
                attacker.buffCounter = 0;
            }

            damage = applyDamageToTarget(defender, damage, roundLines, ignoreDefense);

            if (damage > 0) {
                const mech = attacker.classData.mechanic;

                if (attacker.classKey === 'marksman' && Math.random() < mech.procChance) {
                    const secondHit = Math.floor(damage * 0.7);
                    totalDamageDealt = damage + secondHit;
                    defender.hp -= totalDamageDealt;
                    roundLines.push(`🏹 **¡Doble Disparo!** ${attacker.name} dispara dos veces e inflige **${damage}** + **${secondHit}** de daño.`);
                } else if (attacker.classKey === 'assassin' && Math.random() < mech.procChance) {
                    const secondHit = Math.floor(damage * 0.6);
                    totalDamageDealt = damage + secondHit;
                    defender.hp -= totalDamageDealt;
                    roundLines.push(`🗡️ **¡Golpe Sombra!** ${attacker.name} ataca dos veces e inflige **${damage}** + **${secondHit}** de daño.`);
                } else if (attacker.classKey === 'mage' && Math.random() < mech.procChance) {
                    // Explosión Arcana: daño ya calculado pero IGNORA defensa en el siguiente ataque (preparación)
                    defender.hp -= damage;
                    totalDamageDealt = damage;
                    roundLines.push(`🔮 **¡Explosión Arcana!** ${attacker.name} desata magia pura e inflige **${damage}** de daño.`);
                    // Preparar el siguiente ataque del mago para ignorar defensa
                    attacker.mageNextIgnore = true;
                } else {
                    // Ataque normal sin proc
                    defender.hp -= damage;
                    totalDamageDealt = damage;
                    roundLines.push(`👊 ${attacker.name} ataca e inflige **${damage}** de daño.`);
                }

                // Pasiva vampirismo sobre el daño TOTAL
                if (attacker.passive.onDamageDealt) {
                    const vampText = attacker.passive.onDamageDealt(attacker, totalDamageDealt);
                    if (vampText) roundLines.push(vampText);
                }
            }

            attacker.comboCount = 0;
        }

        // Preparación de Explosión Arcana: si la flag está activa, el siguiente ataque ignora defensa
        if (defender.mageNextIgnore) {
            ignoreDefense = true;
            defender.mageNextIgnore = false;
            roundLines.push(`🔮 **Residual Arcano:** El siguiente ataque de ${defender.name} ignorará defensa.`);
        }

        // --- FASE 4: Pasivas post-damage (Ira Berserker) ---
        for (const p of [p1, p2]) {
            if (p.passive.onLowHp) {
                const lowHpText = p.passive.onLowHp(p);
                if (lowHpText) roundLines.push(lowHpText);
            }
        }

        // Muerte súbita
        if (turn === 11) {
            roundLines.push(`☠️ **¡MUERTE SÚBITA!** El daño se incrementa un 50%.`);
        }

        // Editar mensaje
        const embed = buildEmbed(p1, p2, roundLines.join('\n'), turn);
        if (suddenDeath) {
            embed.title = `☠️ Muerte Súbita — Ronda ${turn}`;
            embed.color = 0xe74c3c;
        }
        await duelMsg.edit({ embeds: [embed] });

        // Cambiar turnos
        [attacker, defender] = [defender, attacker];

        // Verificar empate (ambos mueren en la misma ronda)
        if (p1.hp <= 0 && p2.hp <= 0) {
            break;
        }

        if (p1.hp > 0 && p2.hp > 0) {
            await sleep(3000);
        }
    }

    await sleep(2000);

    // Resultado final
    let finalEmbed;
    if (p1.hp <= 0 && p2.hp <= 0) {
        finalEmbed = {
            color: 0x95a5a6,
            title: '⚖️ ¡EMPATE!',
            description: `**${p1.name}** y **${p2.name}** han caído simultáneamente en la ronda ${turn}.\n\n¡Nadie gana, nadie pierde!`,
        };
    } else {
        const winner = p1.hp > 0 ? p1 : p2;
        const loser = p1.hp > 0 ? p2 : p1;
        finalEmbed = {
            color: 0xf1c40f,
            title: '🏆 ¡DUELO TERMINADO!',
            description: `**${winner.name}** derrota a **${loser.name}** en ${turn} rondas.\n\n¡Enhorabuena ${winner.user.toString()}!`,
        };
    }

    await duelMsg.edit({ embeds: [finalEmbed] });
};
