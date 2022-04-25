const mongoose = require("mongoose");

const diaSchema = new mongoose.Schema({
    serverID: { type: String, require: true, unique: true },
    dia: { type: Date, require: true }
});

const model = mongoose.model('DiaModels', diaSchema);

module.exports = model;