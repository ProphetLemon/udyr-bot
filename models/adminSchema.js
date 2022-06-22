const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true, unique: true },
    endDate: { type: Date }
});

const model = mongoose.model('AdminModels', profileSchema);

module.exports = model;