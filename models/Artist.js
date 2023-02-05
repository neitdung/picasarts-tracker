const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let Schema = mongoose.Schema;

let artist = new Schema({
    address: {
        type: String,
        required: true
    },
    chain: {
        type: String,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false
    },
    user: { type: ObjectId, ref: 'User' }
});
mongoose.models = {};
artist.index({ address: 1, chain: 1 }, { unique: true })
module.exports = mongoose.model('ArtistRequest', artist);