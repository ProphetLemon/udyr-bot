const mongoose = require("mongoose");

const loteriaSchema = new mongoose.Schema({
    serverID: { type: String, require: true, unique: true },
    dia: { type: Date, require: true, unique: true }
});

const model = mongoose.model('LoteriaModels', loteriaSchema);

module.exports = model;