const Discord = require("discord.js");
const { Client, IntentsBitField, Partials } = Discord;
const client = new Client({
    intents: [IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildScheduledEvents,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildPresences],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.Channel]
});
require('dotenv').config();
const mongoose = require("mongoose");
const profileModel = require('./models/profileSchema');
const fs = require('fs');
global.moment = require('moment');
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});
global.loteria = new Map()
global.listaRobos = new Map()
const commandFiles = fs.readdirSync('./comandos/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./comandos/${file}`);
    client.commands.set(command.name, command);
}

mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado a la base de datos");
}).catch((err) => {
    console.log(err);
});
client.login(process.env.DISCORD_TOKEN);
global.horasDiferencia = -1;



global.getCETorCESTDate = function () {
    var localDate = new Date();
    var utcOffset = localDate.getTimezoneOffset();
    var cetOffset = utcOffset + 60;
    var cestOffset = utcOffset + 120;
    var cetOffsetInMilliseconds = cetOffset * 60 * 1000;
    var cestOffsetInMilliseconds = cestOffset * 60 * 1000;

    var cestDateStart = new Date();
    var cestDateFinish = new Date();
    var localDateTime = localDate.getTime();
    var cestDateStartTime;
    var cestDateFinishTime;
    var result;

    cestDateStart.setTime(Date.parse('29 March ' + localDate.getFullYear() + ' 02:00:00 GMT+0100'));
    cestDateFinish.setTime(Date.parse('25 October ' + localDate.getFullYear() + ' 03:00:00 GMT+0200'));

    cestDateStartTime = cestDateStart.getTime();
    cestDateFinishTime = cestDateFinish.getTime();

    if (localDateTime >= cestDateStartTime && localDateTime <= cestDateFinishTime) {
        result = new Date(localDateTime + cestOffsetInMilliseconds);
    } else {
        result = new Date(localDateTime + cetOffsetInMilliseconds);
    }

    return result;
}

global.metodosUtiles = {
    numberWithCommas: function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    isSameDay: function (date1, date2) {
        var dd1 = String(date1.getDate()).padStart(2, '0');
        var mm1 = String(date1.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy1 = date1.getFullYear();

        var dd2 = String(date2.getDate()).padStart(2, '0');
        var mm2 = String(date2.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy2 = date2.getFullYear();

        return (dd1 == dd2 && mm1 == mm2 && yyyy1 == yyyy2);

    },
    /**
     * 
     * @param {Date} date 
     * @returns 
     */
    formatDate: function (date) {
        var dia = String(date.getDate()).padStart(2, "0")
        var mes = String(date.getMonth() + 1).padStart(2, "0")
        var year = String(date.getFullYear()).padStart(2, "0")
        return `${dia}/${mes}/${year}`;

    },
    isValidNumber: function (aux) {
        var numero = String(aux);
        var numeros = "1234567890"
        var isValid = false;
        for (var i = 0; i < numero.length; i++) {
            isValid = false;
            for (var j = 0; j < numeros.length; j++) {
                if (numero.charAt(i) == numeros.charAt(j)) {
                    isValid = true;
                    break;
                }
            }
            if (isValid == false) {
                break;
            }
        }
        return isValid;
    },
    getRandom: function (limite) {
        var cifras = String(limite).length
        var r = 4
        var x = Math.random()
        var random = Math.floor(r * x * (1 - x) * Math.pow(10, cifras))
        if (random > limite) {
            return metodosUtiles.getRandom(limite)
        } else {
            return random
        }
    },
    insultar: function (message) {
        message.reply("maric\u00F3n");
    },
    cambiar_puntos: async function (userID, puntos) {
        let signo = puntos.charAt(0);
        let numero = Number(puntos.slice(1, puntos.length));
        if (signo == '+') {
            await profileModel.findOneAndUpdate({
                userID: userID
            },
                {
                    $inc: {
                        udyrcoins: numero
                    }
                })
        } else {
            await profileModel.findOneAndUpdate({
                userID: userID
            },
                {
                    $inc: {
                        udyrcoins: -numero
                    }
                })
        }
    }
}
