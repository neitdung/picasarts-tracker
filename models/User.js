const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let user = new Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
    banner: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    facebook: {
        type: String,
        required: false
    },
    twitter: {
        type: String,
        required: false
    },
    instagram: {
        type: String,
        required: false
    },
    website: {
        type: String,
        required: false
    },
});
mongoose.models = {};

module.exports = mongoose.model('User', user);