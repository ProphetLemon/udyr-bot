const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true },
    udyrcoins: { type: Number, default: 1000 },
    dailyGift: { type: Date }
});

const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;