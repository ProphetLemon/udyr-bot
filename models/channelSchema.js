const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    channelID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true }
});

const model = mongoose.model('ChannelModels', channelSchema);

module.exports = model;