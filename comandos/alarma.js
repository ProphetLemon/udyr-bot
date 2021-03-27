module.exports = {
    name: 'alarma',
    aliases: [],
    description: 'Funcion para crear apuestas o apostar en ellas',
    execute(message,args,cmd,client,Discord,profileData) {
        let dia = args[0];
        let hora = args[1];
        let motivo = message.content.split("\"")[1];
        let dtAlarm = new Date();
        var regexDia = /\d{1,2}\/\d{2}/;
        var regexHora = /\d{1,2}\:\d{2}/;
        if ((!regexHora.test(hora)) || (dia != "hoy" && dia != "ma\u00F1ana" && !regexDia.test(dia))) {
            metodosUtiles.insultar(message);
            return;
        }
        if (regexDia.test(dia)) {
            let mes = Number(dia.split("/")[1]) - 1;
            dia = Number(dia.split("/")[0]);
            dtAlarm.setMonth(mes)
            dtAlarm.setDate(dia);
        } else if (dia == "ma\u00F1ana") {
            dtAlarm.setDate(dtAlarm.getDate() + 1);
        }
        let horas = Number(hora.split(":")[0]);
        let minutos = Number(hora.split(":")[1]);
        dtAlarm.setMinutes(minutos);
        dtAlarm.setHours(horas);
        dtAlarm.setSeconds(0);
        let dtNow = new Date();
        dtNow.setHours(dtNow.getHours() - horasDiferencia);
        if (dtAlarm - dtNow <= 0) {
            metodosUtiles.insultar(message);
            return;
        }
        let diff = dtAlarm - dtNow;
        setTimeout(function () { message.reply("Oye, te recuerdo esto : \"" + motivo + "\""); }, diff);
        message.reply("Se ha creado la alarma correctamente!").then(msg=>{
            msg.delete({timeout:3000});
            message.delete();
        });
    }
}