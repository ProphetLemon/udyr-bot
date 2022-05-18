const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true },
    udyrcoins: { type: Number },
    dailyGift: { type: Date },
    robar: { type: Date },
    wordle: { type: String },
    wordleEmpezado: { type: Boolean },
    nivel: { type: Number, default: 0 },
    descripcion: { type: String, default: 'Un maric\u00F3n m\u00E1s de este servidor' },
    wallet: { type: Map }
});

const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;