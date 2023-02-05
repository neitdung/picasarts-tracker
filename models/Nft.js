const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let nft = new Schema({
    chain: {
        type: String,
        default: "calamus",
    },
    contract_address: {
        type: String,
        required: true,
    },
    token_id: {
        type: String,
        required: true,
    },
    ipnft: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    external_url: {
        type: String,
    },
    royalty: {
        type: String,
    },
    background_color: {
        type: String,
    },
    creator_address: {
        type: String,
    },
    owner: {
        type: String,
    },
    attributes: [{
        display_type: String,
        trait_type: String,
        value: String
    }],
});
mongoose.models = {};
nft.index({ ipnft: 1, chain: 1 }, { unique: true })

module.exports = mongoose.model('Nft', nft);