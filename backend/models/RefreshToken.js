const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
    refreshToken: {
        type: String,
        required: true
    },
}, { collection: "refreshTokens" });

module.exports = RefreshToken = mongoose.model("refreshTokens", RefreshTokenSchema);