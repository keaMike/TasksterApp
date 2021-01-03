const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const TeamSchema = new Schema({
    teamname: {
        type: String,
        required: true
    },
    token: {
        type: String,
        default: uuidv4()
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
}, { collection: "teams" });

module.exports = Team = mongoose.model("team", TeamSchema);