const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let token = new Schema({
    address: {
        type: String,
        required: true
    },
    chain: {
        type: String,
        default: "calamus"
    },
    name: {
        type: String,
    },
    symbol: {
        type: String,
    },
    decimals: {
        type: Number
    },
    logo: {
        type: Number
    }
});
mongoose.models = {};
token.index({ address: 1, chain: 1 }, { unique: true })
module.exports = mongoose.model('Token', token);