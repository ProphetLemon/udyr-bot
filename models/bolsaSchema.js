const mongoose = require("mongoose");

const bolsaSchema = new mongoose.Schema({
    nombre: { type: String, require: true, unique: true },
    valorInicial: { type: Number, require: true },
    valorFinal: { type: Number, require: true },
    dateFinal: { type: Date, require: true },
    random: { type: Number, require: true, default: 0 },
    historico: { type: [Number], require: true, default: [] },
    color: { type: String, default: "" }
});

const model = mongoose.model('BolsaModels', bolsaSchema);

module.exports = model;