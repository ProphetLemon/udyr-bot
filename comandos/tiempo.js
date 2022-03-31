const weather = require('weather-js');
function stringToDate(stringFecha) {
    var dia = ""
    switch (stringFecha) {
        case "Monday":
            dia = "Lunes"
            break;
        case "Tuesday":
            dia = "Martes"
            break;
        case "Wednesday":
            dia = "Mi\u00E9rcoles"
            break;
        case "Thursday":
            dia = "Jueves"
            break;
        case "Friday":
            dia = "Viernes"
            break;
        case "Saturday":
            dia = "S\u00E1bado"
            break;
        case "Sunday":
            dia = "Domingo"
            break;
    }
    return dia
}
function textToEmoji(text) {
    var emoji = ""
    switch (text) {
        case "Partly Cloudy":
            emoji = ":partly_sunny:"
            break;
        case "Mostly Cloudy":
            emoji = ":white_sun_cloud:"
            break;
        case "Rain Showers":
            emoji = ":cloud_rain:"
            break;
        case "Partly Sunny":
            emoji = ":partly_sunny:"
            break;
        case "Clear":
            emoji = ":sunny:"
            break;
        case "Sunny":
            emoji = ":sunny:"
            break;
        case "Mostly Sunny":
            emoji = ":white_sun_small_cloud:"
            break;
        case "Cloudy":
            emoji = ":cloud:"
            break;
        case "Light Rain":
            emoji = ":cloud_rain:"
            break;
        default:
            emoji = text
    }
    return emoji
}
module.exports = {
    name: 'tiempo',
    aliases: [],
    description: 'Funcion que te da el tiempo de un lugar',
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {string} cmd 
     * @param {Client} client 
     * @param {*} Discord 
     * @param {*} profileData 
     */
    async execute(message, args, cmd, client, Discord, profileData) {
        var resultado
        weather.find({ search: args.join(" "), degreeType: 'C' }, function (err, result) {
            if (err) {
                console.log(err);
                message.channel.send("Ha habido un fallo")
                return
            }
            resultado = JSON.parse(JSON.stringify(result, null, 2))
            var registro = resultado[0]
            mensaje = ""
            mensaje += `Tiempo en ${registro.current.observationpoint}\nAhora mismo: ${registro.current.temperature}ºC ${textToEmoji(registro.current.skytext)}\n` +
                `Hoy: ${textToEmoji(registro.forecast[1].skytextday)} T.M\u00E1xima: ${registro.forecast[1].high}ºC, T.M\u00EDnima: ${registro.forecast[1].low}ºC, Prob. LLuvia: ${registro.forecast[1].precip}%\n`
            for (let i = 2; i < registro.forecast.length; i++) {
                mensaje += `${stringToDate(registro.forecast[i].day)}:${textToEmoji(registro.forecast[i].skytextday)} T.M\u00E1xima: ${registro.forecast[i].high}ºC, T.M\u00EDnima: ${registro.forecast[i].low}ºC, Prob. LLuvia: ${registro.forecast[i].precip}%\n`
            }
            message.channel.send(mensaje).then(msg => {
                if (message.guild != null) {
                    message.delete()
                }
                setTimeout(() => {
                    msg.delete()
                }, 12000);
            })
        });

    }
}