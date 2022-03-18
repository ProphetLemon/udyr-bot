const mongoose = require("mongoose");

const roboSchema = new mongoose.Schema({
    userIDLadron: { type: String, require: true, unique: true },
    userIDAfectado: { type: String, require: true },
    dinero: { type: Number, require: true }
});

const model = mongoose.model('RoboModels', roboSchema);

module.exports = model;