const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    creatorID: String,
    title: String,
    projectID: String,
    topicID: String,
    notebookID: String,
    time: Date,
    content: String,
    label: String
});

module.exports = mongoose.model("Note", NoteSchema);