const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true },
    udyrcoins: { type: Number },
    dailyGift: { type: Date },
    robar: { type: Date },
    wordle: { type: String },
    wordleEmpezado: { type: Boolean }
});

const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;