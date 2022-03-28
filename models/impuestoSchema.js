const mongoose = require("mongoose");

const impuestoSchema = new mongoose.Schema({
    serverID: { type: String, require: true, unique: true },
    udyrcoins: { type: Number, default: 0 }
});

const model = mongoose.model('ImpuestoModels', impuestoSchema);

module.exports = model;