const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    login: String,
    password: String,
    name: String,
    avatar: String,
    authTokens: Array,
    registeredTime: Date
});

module.exports = mongoose.model("User", UserSchema);