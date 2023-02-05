const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let collection = new Schema({
    chain: {
        type: String,
        default: "calamus"
    },
    cid: {
        type: String,
        required: true,
    },
    contract_address: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
    },
    hash: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    symbol: {
        type: String,
    },
    logo: {
        type: String,
    },
    banner: {
        type: String,
    },
    facebook: {
        type: String,
    },
    twitter: {
        type: String,
    },
    instagram: {
        type: String,
    },
    website: {
        type: String,
    },
});
mongoose.models = {};
collection.index({ contract_address: 1, chain: 1, cid: 1 }, { unique: true })

module.exports = mongoose.model('Collection', collection);