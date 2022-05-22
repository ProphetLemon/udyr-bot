const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
    serverID: { type: String, require: true, unique: true },
    datePago: { type: Date, require: true }
});

const model = mongoose.model('PayoutModels', payoutSchema);

module.exports = model;