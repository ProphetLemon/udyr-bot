const mongoose = require("mongoose");

const boletoSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    numeroBoleto: { type: String, require: true, unique: true, maxLength: 5 }
});

const model = mongoose.model('BoletoModels', boletoSchema);

module.exports = model;