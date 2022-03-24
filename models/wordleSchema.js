const mongoose = require("mongoose");

const wordleSchema = new mongoose.Schema({
    palabra: { type: String, require: true, unique: true },
    dia: { type: String, require: true, unique: true }
});

const model = mongoose.model('WordleModels', wordleSchema);

module.exports = model;