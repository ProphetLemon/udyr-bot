const Discord = require("discord.js");
const client = new Discord.Client();
require('dotenv').config();
const mongoose = require("mongoose");
const profileModel = require('./models/profileSchema');
const fs = require('fs');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler','event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

const commandFiles = fs.readdirSync('./comandos/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./comandos/${file}`);
    client.commands.set(command.name,command);
}

mongoose.connect(process.env.MONGODB_SRV,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:true
}).then(()=>{
    console.log("Conectado a la base de datos");
}).catch((err)=>{
    console.log(err);
});
client.login(process.env.DISCORD_TOKEN);
global.horasDiferencia = -1;

global.metodosUtiles ={
    numberWithCommas : function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    isSameDay : function (date1, date2) {
        var dd1 = String(date1.getDate()).padStart(2, '0');
        var mm1 = String(date1.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy1 = date1.getFullYear();
    
        var dd2 = String(date2.getDate()).padStart(2, '0');
        var mm2 = String(date2.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy2 = date2.getFullYear();
    
        return (dd1 == dd2 && mm1 == mm2 && yyyy1 == yyyy2);
    
    },

    isValidNumber : function (aux) {
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
            if (!isValid) {
                break;
            }
        }
        return isValid;
    },

    isMention : function (mention) {
        let inicio = mention.slice(0, 3);
        let numero = 0;
        let fin = mention.slice(mention.length - 1, mention.length);
        if (inicio == "<@!") {
            numero = mention.slice(3, mention.length - 1);
            fin = mention.slice(mention.length - 1, mention.length);
        } else if ("<@") {
            inicio = mention.slice(0, 2);
            numero = mention.slice(2, mention.length - 1);
        }
        return (inicio == "<@!" || inicio == "<@") && metodosUtiles.isValidNumber(numero) && fin == ">";
    },

    isRol : function (mention) {
        let inicio = mention.slice(0, 3);
        let numero = mention.slice(3, mention.length - 1);
        let fin = mention.slice(mention.length - 1, mention.length);
        return inicio == "<@&" && metodosUtiles.isValidNumber(numero) && fin == ">";
    },

    returnIdFromMention : function (mention) {
        let inicio = mention.slice(0, 3);
        let numero = 0
        if (inicio == "<@!" || inicio == "<@&") {
            numero = mention.slice(3, mention.length - 1);
        } else {
            numero = mention.slice(2, mention.length - 1);
        }
        return numero;
    },

   cambiarMinutos : function(date) {
        var minutos = String(date.getMinutes());
        if (minutos.length == 1) {
            return "0" + minutos;
        } else {
            return minutos;
        }
    },

    insultar : function (message) {
        message.reply("maric\u00F3n");
    } ,  
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
