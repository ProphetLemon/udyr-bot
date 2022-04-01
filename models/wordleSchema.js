const mongoose = require("mongoose");

const wordleSchema = new mongoose.Schema({
    palabra: { type: String, require: true, unique: true },
    dia: { type: String, require: true, unique: true },
    aprobada: { type: Boolean, default: false }
});

const model = mongoose.model('WordleModels', wordleSchema);

module.exports = model;