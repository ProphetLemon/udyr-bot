function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    const p1 = { user: message.author, name: message.author.displayName || message.author.username, hp: 100, maxHp: 100 };
    const p2 = { user: mentioned, name: mentioned.displayName || mentioned.username, hp: 100, maxHp: 100 };

    // Presentacion
    await message.channel.send(
        `⚔️ **¡DUELO A MUERTE CON CUCHILLOS DE CARNICERO!** ⚔️\n\n` +
        `${p1.name} **VS** ${p2.name}\n\n` +
        `Cada uno empieza con **100 HP**. ¡Que empiece la masacre!`
    );

    let turn = 0;
    let attacker = p1;
    let defender = p2;

    while (p1.hp > 0 && p2.hp > 0) {
        await sleep(2500);
        turn++;

        const roll = Math.random();
        let resultText = '';
        let damage = 0;

        if (roll < 0.10) {
            // Parry: el defensor devuelve la mitad del daño que habria recibido
            const baseDmg = randomInt(10, 25);
            const reflected = Math.floor(baseDmg / 2);
            attacker.hp -= reflected;
            resultText = `🛡️ **¡PARRY!** ${defender.name} devuelve el golpe y ${attacker.name} recibe **${reflected}** de daño reflejado.`;
        } else if (roll < 0.25) {
            // Defensa: el defensor bloquea todo
            resultText = `🛡️ ${defender.name} se defiende perfectamente. **0** de daño.`;
        } else if (roll < 0.40) {
            // Critico: daño x2
            damage = randomInt(10, 20) * 2;
            defender.hp -= damage;
            resultText = `💥 **¡GOLPE CRITICO!** ${attacker.name} desata toda su furia e inflige **${damage}** de daño.`;
        } else {
            // Ataque normal
            damage = randomInt(10, 20);
            defender.hp -= damage;
            resultText = `👊 ${attacker.name} ataca e inflige **${damage}** de daño.`;
        }

        const hpBar = (p) => {
            const filled = Math.max(0, Math.ceil((p.hp / p.maxHp) * 10));
            const empty = 10 - filled;
            return '❤️'.repeat(filled) + '🖤'.repeat(empty) + ` **${Math.max(0, p.hp)} HP**`;
        };

        await message.channel.send(
            `**Ronda ${turn}** — Turno de ${attacker.name}\n` +
            `${resultText}\n\n` +
            `${p1.name}: ${hpBar(p1)}\n` +
            `${p2.name}: ${hpBar(p2)}`
        );

        // Cambiar turnos
        [attacker, defender] = [defender, attacker];
    }

    await sleep(2000);

    const winner = p1.hp > 0 ? p1 : p2;
    const loser = p1.hp > 0 ? p2 : p1;

    await message.channel.send(
        `🏆 **¡${winner.name} GANA EL DUELO!** 🏆\n\n` +
        `${loser.name} ha caido derrotado en el campo de batalla.\n` +
        `¡Enhorabuena ${winner.user.toString()}!`
    );
};
