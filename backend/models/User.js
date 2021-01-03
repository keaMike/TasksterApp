const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    teamToken: {
        type: String,
        default: ""
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isConfirmed: {
        type: Boolean,
        default: false
    }
}, { collection: "users" });

module.exports = User = mongoose.model("user", UserSchema);