const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    name: String,
    topicID: String,
    creatorID: String
});

module.exports = mongoose.model("Project", ProjectSchema);