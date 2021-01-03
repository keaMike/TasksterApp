const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    teamToken: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    assignedTo: {
        type: String,
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
}, { collection: "tasks" });

module.exports = Task = mongoose.model("task", TaskSchema);