const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    todoID: String,
    name: String,
    time: Date,
    creatorID: String,
    todoID: String,
    projectID: String,
    topicID: String,
    labels: Array,
    isDone: Boolean
});

module.exports = mongoose.model("Task", TaskSchema);