var tramo1 = (12450 * 19) / 100;
var tramo2 = ((20200 - 12450) * 24) / 100;
var tramo3 = ((35200 - 20200) * 30) / 100;
var tramo4 = ((60000 - 35200) * 37) / 100;
var tramo5 = ((300000 - 60000) * 45) / 100;
module.exports = {
    name: 'hacienda',
    aliases: [],
    description: 'Funcion para calcular lo que te roba hacienda',
    execute(message, args, cmd, client, Discord, profileData) {
        console.log("INICIO HACIENDA");
        var dinero = args[0];
        var dinero_final = 0;
        var dinero_descontado = 0;
        if (dinero <= 12450) {
            dinero_descontado = (dinero * 19) / 100;
        } else if (dinero <= 20200) {
            dinero_descontado = (((dinero - 12450) * 24) / 100) + tramo1;
        } else if (dinero <= 35200) {
            dinero_descontado = (((dinero - 20200) * 30) / 100) + tramo1 + tramo2;
        } else if (dinero <= 60000) {
            dinero_descontado = (((dinero - 35200) * 37) / 100) + tramo1 + tramo2 + tramo3;
        } else if (dinero <= 300000) {
            dinero_descontado = (((dinero - 60000) * 45) / 100) + tramo1 + tramo2 + tramo3 + tramo4;
        } else if (dinero > 300000) {
            dinero_descontado = (((dinero - 300000) * 47) / 100) + tramo1 + tramo2 + tramo3 + tramo4 + tramo5;
        }
        dinero_final = dinero - dinero_descontado;
        var porcentaje_final = (dinero_final * 100) / dinero
        dinero = metodosUtiles.numberWithCommas((parseFloat(dinero).toFixed(2)));
        dinero_final = metodosUtiles.numberWithCommas((parseFloat(dinero_final).toFixed(2)));
        dinero_descontado = metodosUtiles.numberWithCommas((parseFloat(dinero_descontado).toFixed(2)));
        console.log("FIN HACIENDA");
        return message.channel.send("Dinero original: " + dinero + "\nDinero descontado: " + dinero_descontado + " (" + parseFloat(100 - porcentaje_final).toFixed(2) + "%)\nDinero final: " + dinero_final + " (" + parseFloat(porcentaje_final).toFixed(2) + "%)")
    }
}