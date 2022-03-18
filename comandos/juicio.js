const { Message, Client } = require('discord.js');
const profileModel = require('../models/profileSchema');
const roboModel = require('../models/roboSchema');
module.exports = {
    name: 'juicio',
    aliases: [],
    description: 'Funcion hacer un juicio',
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
        if (!profileData) return message.reply("No tas inscrito en la Liga Udyr, maric\u00F3n. Haz un 'udyr puntos' antes")
        if (!message.mentions.members.first()) {
            return message.reply("no has mencionado a nadie bobo")
        }
        var robado = await roboModel.find({
            userIDAfectado: message.member.id
        })
        if (robado.length == 0) {
            return message.reply("nadie te ha robado nada bobo")
        }
        var acusado = message.mentions.members.first()
        var caso = await roboModel.findOne({
            userIDAfectado: message.member.id,
            userIDLadron: acusado.id
        })
        if (caso) {
            var memes = ["https://thumbs.dreamstime.com/b/ladr%C3%B3n-de-sexo-masculino-que-roba-la-chica-joven-hermosa-47978550.jpg", "https://www.serargentino.com/public/images/2019/12/Tucumanos-ladrones-773x458.jpeg"
                , "https://ichef.bbci.co.uk/news/640/cpsprodpb/043A/production/_101228010_gettyimages-51431550.jpg",
                "https://www.filco.es/uploads/2019/12/pensadorcarcel1.jpg", "https://static.vecteezy.com/system/resources/previews/002/247/441/non_2x/a-man-thinking-in-prison-vector.jpg",
                "https://elsumario.com/wp-content/uploads/2018/03/El-Sumario-%E2%80%93-Hombre-va-a-prisi%C3%B3n-por-matar-a-una-cucaracha.jpg", "https://previews.123rf.com/images/bowie15/bowie151202/bowie15120200046/12394056-sad-businessman-in-prison.jpg",
                "https://media.tenor.com/images/5e2302c3fb99b00a690898303d9bd666/tenor.png", "https://notinerd.com/wp-content/uploads/2018/08/5-193.jpg", "https://www.ustedpregunta.com/data/articulos/por-que-usan-peluca-los-jueces/5eabc7ef6fe1f.jpg"
                , "https://st4.depositphotos.com/13194036/i/600/depositphotos_313993416-stock-photo-smiling-judge-judicial-robe-wig.jpg"]
            message.channel.send(`${message.member.displayName} has encontrado a tu ladr\u00F3n! Se te devolver\u00E1 el dinero inmediatamente` +
                ` y al maric\u00F3n de ${acusado.displayName} se le quitar\u00E1 dinero`)
            message.channel.send(memes[Math.floor(Math.random() * memes.length)])
            var porcentaje = Math.floor((caso.dinero / (profileData.udyrcoins + caso.dinero)) * 100)
            var acusadoProfile = await profileModel.findOne({
                userID: acusado.id,
                serverID: message.guild.id
            })
            var impuesto = Math.floor((acusadoProfile.udyrcoins * porcentaje) / 100)
            await profileModel.findOneAndUpdate({
                userID: acusado.id,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: -impuesto
                }
            })
            await roboModel.findOneAndRemove({
                userIDAfectado: message.member.id,
                userIDLadron: acusado.id
            })
            await profileModel.findOneAndUpdate({
                userID: message.member.id,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: caso.dinero
                }
            })
            clearTimeout(listaRobos.get(acusado.id))
        } else {
            var memes = ["https://img.mundifrases.com/images/thumb_bundle-118-robar.650x250_q95_box-0,0,647,247.jpg", "https://www.tecnicom.info/wp-content/uploads/perfil-de-un-ladr%C3%B3n.jpg",
                "https://c.files.bbci.co.uk/3B99/production/_96975251_gettyimages-186869920.jpg", "https://www.redeszone.net/app/uploads-redeszone.net/2019/05/detectar-robo-identidad.jpg?x=480&y=375&quality=40",
                "https://blog.hernandez-vilches.com/wp-content/uploads/robo-o-hurto.jpg", "https://cdn.discordapp.com/attachments/953974289919520778/954353275765948426/depositphotos_181139154-stock-photo-kidnapper-with-tied-woman-isolated.png",
                "https://previews.123rf.com/images/kadmy/kadmy1301/kadmy130100017/17276432-dieb-entf%C3%BChrer-mit-kind-isoliert.jpg", "https://thumbs.dreamstime.com/z/el-secuestrador-con-la-mujer-atada-aislada-en-blanco-107917170.jpg",
                "https://previews.123rf.com/images/kadmy/kadmy1301/kadmy130100017/17276432-dieb-entf%C3%BChrer-mit-kind-isoliert.jpg", "https://img.mundifrases.com/images/thumb_bundle-118-robar.650x250_q95_box-0,0,647,247.jpg",
                "https://sorollaseguridad.es/wp-content/uploads/2014/11/ladron-tiempo1.jpg", "https://thumbs.dreamstime.com/b/ladr%C3%B3n-de-sexo-masculino-que-roba-la-chica-joven-hermosa-47978071.jpg",
                "https://thumbs.dreamstime.com/b/ladr%C3%B3n-de-sexo-masculino-con-el-arma-listo-para-robar-la-chica-joven-47977121.jpg", "https://cr00.epimg.net/radio/imagenes/2019/03/26/judicial/1553608538_333454_1553608611_noticia_normal.jpg",
                "https://www.periodistadigital.com/wp-content/uploads/2016/07/Un-ladro%CC%81n-bastante-tonto.jpg?width=1200&enable=upscale", "https://ideasqueayudan.com/wp-content/uploads/2016/09/01-Sep-2016_Criminales.jpg",
                "https://pbs.twimg.com/media/ElRXZ5PWMAE27hT.jpg"]
            var casoVerdadero = robado[0]
            message.channel.send(`Has acusado a una persona inocente y se te cobrara un impuesto por calumnias e injurias a la persona acusada.\n Por tanto <@!${casoVerdadero.userIDLadron}> se ha salido con la suya`)
            message.channel.send(memes[Math.floor(Math.random() * memes.length)])
            var porcentaje = Math.floor((casoVerdadero.dinero / (profileData.udyrcoins + casoVerdadero.dinero)) * 100)
            var acusadoProfile = await profileModel.findOne({
                userID: message.member.id,
                serverID: message.guild.id
            })
            var impuesto = Math.floor((acusadoProfile.udyrcoins * porcentaje) / 100)
            await profileModel.findOneAndUpdate({
                userID: message.member.id,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: -impuesto
                }
            })
            await roboModel.findOneAndRemove({
                userIDAfectado: message.member.id,
                userIDLadron: casoVerdadero.userIDLadron
            })
            await profileModel.findOneAndUpdate({
                userID: casoVerdadero.userIDLadron,
                serverID: message.guild.id
            }, {
                $inc: {
                    udyrcoins: casoVerdadero.dinero
                }
            })
            clearTimeout(listaRobos.get(casoVerdadero.userIDLadron))
        }
    }
}