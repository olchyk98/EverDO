const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TopicSchema = new Schema({
    name: String,
    color: String,
    creatorID: String,
    time: Date
});

module.exports = mongoose.model("Topic", TopicSchema);