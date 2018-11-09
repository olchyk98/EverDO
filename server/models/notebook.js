const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotebookSchema = new Schema({
    creatorID: String,
    name: String,
    projectID: String,
    topicID: String,
    time: Date
});

module.exports = mongoose.model("Notebook", NotebookSchema);