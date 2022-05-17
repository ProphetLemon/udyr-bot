const { Message } = require("discord.js");

module.exports = {
    name: 'horse',
    aliases: [],
    description: 'Funcion copiada de https://stackoverflow.com/questions/68709248/discord-js-problem-i-have-a-horse-race-command-and-im-trying-to-make-it-so-only',
    execute(message, args, cmd, client, Discord, profileData) {
		return
        startRace(message, args, cmd, client, Discord, profileData)
    }
}
/**
 * 
 * @param {Message} message 
 * @param {*} args 
 * @param {*} cmd 
 * @param {*} client 
 * @param {*} Discord 
 * @param {*} profileData 
 */
function startRace(message, args, cmd, client, Discord, profileData) {
    const trackLength = 50;
    const initialHorseDistance = 100;
    const numberOfHorses = 6;
    const horseNames = ["Athemir", "Rildonis", "Hyrget", "Maldonar", "Zael", "Getha"];

    message.channel.send("Our participants are:\n" + horseNames.map((horseName, i) => { return `${i + 1}: ${horseName}` }).join('\n'));

    let horseDistances = Array(numberOfHorses).fill(initialHorseDistance);
    raceTrack = renderRaceTrack(horseDistances, trackLength, initialHorseDistance);

    const bettingReactions = ["\u0030\u20E3", "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"];

    message.channel.send("Bettings open for 10 minutes, place bets now.").then(
        async message => {
            // const emoji = message.guild.emojis.find('name', 'one');
            await message.react(bettingReactions[1]);
            await message.react(bettingReactions[2]);
            await message.react(bettingReactions[3]);
            await message.react(bettingReactions[4]);
            await message.react(bettingReactions[5]);
            await message.react(bettingReactions[6]);

            // bettingReactions.forEach(async reaction => {await message.react(reaction)} );
        }
    ).then(() => {
        const filter = (reaction, user) => user.id
        message.awaitReactions(filter, { time: 10000 })
            .then(collected => {
                console.log(collected[0]);
            })
            .then(() => {
                message.channel.send("Bets received, starting race.");
                message.channel.send(raceTrack).then(message => { createNextFrame(message, horseDistances, trackLength, initialHorseDistance, 0) });
            })
    });
}

function createNextFrame(message, horseDistances, trackLength, initialHorseDistance, n) {
    let winners = [];
    horseDistances.forEach((length, horse_index) => {
        length = length - Math.floor(Math.random() * 3 + 1);
        horseDistances[horse_index] = length;
        if (length <= 0) winners.push(horse_index);
    });
    console.log(n);
    console.log(horseDistances);
    if (winners.length > 0) {
        message.edit(renderRaceTrack(horseDistances, trackLength, initialHorseDistance));
        return declareWinner(message, winners);
    }

    message.edit(renderRaceTrack(horseDistances, trackLength, initialHorseDistance)).then(message => {
        setTimeout(() => {
            createNextFrame(message, horseDistances, trackLength, initialHorseDistance, n + 1);
        }, 1000);
    })
}

function declareWinner(message, winners) {
    console.log("Winner declared!")
    if (winners.length === 1)
        message.channel.send(`Horse ${winners[0] + 1} has WON!`);
    else
        message.channel.send(`There has been a draw between horses ${winners[0] + 1} and ${winners[0] + 1}`);
}

function renderRaceTrack(horseDistances, trackLength, initialHorseDistance) {
    const horse = '<:centaurracer:874074443184500847>';
    const finish = ':checkered_flag:';
    const trackSeperator = '-';
    const bar = '|';
    const lane = '`' + trackSeperator.repeat(trackLength) + '`' + '\n';
    let raceTrack = lane;
    for (i = 0; i < horseDistances.length; i++) {
        currentHorseDistance = horseDistances[i] < 0 ? 0 : horseDistances[i];
        raceTrack = raceTrack + finish + bar + ' '.repeat(currentHorseDistance) + horse + ' '.repeat(initialHorseDistance - currentHorseDistance) + bar + ' ' + bar + ' ' + (i + 1) + '\n' + lane;
    }
    return raceTrack;

}