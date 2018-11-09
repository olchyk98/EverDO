const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    creatorID: String,
    name: String,
    projectID: String,
    topicID: String,
    time: Date,
    url: String,
    format: String,
    label: String
});

module.exports = mongoose.model("File", FileSchema);