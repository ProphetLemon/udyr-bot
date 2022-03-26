const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true },
    udyrcoins: { type: Number },
    dailyGift: { type: Date },
    robar: { type: Date },
    wordle: { type: String },
    wordleEmpezado: { type: Boolean },
    descripcion: { type: String, default: 'Un maric\u00F3n m\u00E1s de este servidor' }
});

const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;