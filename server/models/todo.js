const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    title: String,
    creatorID: String,
    projectID: String,
    topicID: String,
    time: Date
});

module.exports = mongoose.model("Todo", TodoSchema);